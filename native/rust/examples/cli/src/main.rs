use std::{
    collections::HashMap,
    env,
    io::{self, Write},
    path::PathBuf,
    time::Duration,
};

use anyhow::Error;
use hum_matrix_core::{HumClient, Result, TextMessage, config::ClientConfig};
use matrix_sdk::{
    Client,
    authentication::matrix::MatrixSession,
    ruma::{OwnedRoomId, OwnedUserId},
};
use tokio::sync::mpsc;

// TUI
use crossterm::{
    event::{self, Event as CEvent, KeyCode, KeyEventKind},
    execute,
    terminal::{EnterAlternateScreen, LeaveAlternateScreen, disable_raw_mode, enable_raw_mode},
};
use ratatui::{
    Terminal,
    backend::CrosstermBackend,
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, List, ListItem, Paragraph},
};

#[tokio::main]
async fn main() -> Result<()> {
    let homeserver = env::var("MATRIX_HS").unwrap_or_else(|_| "https://matrix.org".to_owned());
    let store_path = env::var("MATRIX_STORE").unwrap_or_else(|_| "hum_store".into());
    let store_path = PathBuf::from(store_path);
    std::fs::create_dir_all(&store_path).map_err(Error::from)?;

    let cfg = ClientConfig::new(homeserver, store_path.clone());
    let client = HumClient::new(cfg).await?;

    // Try to restore a previous session to avoid creating a new device
    let session_path = store_path.join("session.json");
    let restored = if let Ok(session_json) = std::fs::read_to_string(&session_path) {
        match serde_json::from_str::<MatrixSession>(&session_json) {
            Ok(session) => {
                if let Err(e) = client.inner().restore_session(session).await {
                    eprintln!("Failed to restore session, falling back to login: {e}");
                    false
                } else {
                    true
                }
            }
            Err(e) => {
                eprintln!("Invalid session file, ignoring: {e}");
                false
            }
        }
    } else {
        false
    };

    if !restored {
        let username = env::var("MATRIX_USER").expect("MATRIX_USER must be set");
        let password = env::var("MATRIX_PASS").expect("MATRIX_PASS must be set");
        client.login_username(&username, &password).await?;
        // Persist session for future runs (prevents device ID mismatch)
        if let Some(session) = client.inner().matrix_auth().session() {
            let json = serde_json::to_string_pretty(&session).map_err(Error::from)?;
            std::fs::write(&session_path, json).map_err(Error::from)?;
        }
    }

    // Forward matrix events into the UI via channel
    let (tx, rx) = mpsc::unbounded_channel::<UiEvent>();
    // Core -> UI event bridge
    let (tx_msg, mut rx_msg) = mpsc::unbounded_channel::<TextMessage>();
    client.forward_text_messages_to(tx_msg);
    let tx_ui = tx.clone();
    tokio::spawn(async move {
        while let Some(tm) = rx_msg.recv().await {
            let _ = tx_ui.send(UiEvent::IncomingMessage {
                room_id: tm.room_id,
                sender: tm.sender,
                body: tm.body,
            });
        }
    });

    if !restored {
        // Unlock secret storage using the recovery key once for this device
        let recovery_key = if let Ok(key) = env::var("MATRIX_RECOVERY_KEY") {
            key
        } else {
            print!("Enter recovery key: ");
            io::stdout().flush().ok();
            let mut input = String::new();
            io::stdin().read_line(&mut input).ok();
            input.trim().to_owned()
        };

        // Import cross-signing keys before starting sync so we can decrypt immediately
        if let Err(e) = client.bootstrap_from_recovery_key(&recovery_key).await {
            eprintln!("Warning: could not verify/import secrets with recovery key: {e}");
        } else {
            println!("Device successfully verified via recovery key");
        }
    }

    client.start_sync_background().await?;
    if let Ok(room) = env::var("MATRIX_ROOM") {
        client.send_text(&room, "Hello from Hum CLI").await?;
    }

    // Launch TUI
    let my_user = client
        .inner()
        .user_id()
        .ok_or_else(|| Error::msg("missing user id"))?
        .to_owned();
    let sdk_client = client.inner().clone();

    // Build initial room list
    let rooms = sdk_client
        .joined_rooms()
        .into_iter()
        .map(|r| RoomItem {
            id: r.room_id().to_owned(),
            name: r.room_id().to_string(),
            unread: 0,
        })
        .collect::<Vec<_>>();

    let mut app = App::new(my_user, rooms);
    run_ui(&sdk_client, &client, rx, &mut app).await?;
    Ok(())
}

// === UI Types and Logic ===

#[derive(Debug, Clone)]
enum UiEvent {
    IncomingMessage {



        
        room_id: OwnedRoomId,
        sender: OwnedUserId,
        body: String,
    },
}

#[derive(Debug, Clone)]
struct RoomItem {
    id: OwnedRoomId,
    name: String,
    unread: usize,
}

#[derive(Debug, Clone)]
struct Msg {
    sender: String,
    body: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Mode {
    RoomList,
    RoomView,
}

struct App {
    mode: Mode,
    rooms: Vec<RoomItem>,
    selected: usize,
    messages: HashMap<OwnedRoomId, Vec<Msg>>,
    next_from: HashMap<OwnedRoomId, Option<String>>,
    input: String,
    scroll: usize,
    my_user: OwnedUserId,
}

impl App {
    fn new(my_user: OwnedUserId, rooms: Vec<RoomItem>) -> Self {
        Self {
            mode: Mode::RoomList,
            rooms,
            selected: 0,
            messages: HashMap::new(),
            next_from: HashMap::new(),
            input: String::new(),
            scroll: 0,
            my_user,
        }
    }

    fn current_room_id(&self) -> Option<&OwnedRoomId> {
        self.rooms.get(self.selected).map(|r| &r.id)
    }

    fn on_incoming(&mut self, ev: UiEvent) {
        match ev {
            UiEvent::IncomingMessage {
                room_id,
                sender,
                body,
            } => {
                let msg = Msg {
                    sender: sender.to_string(),
                    body,
                };
                self.messages.entry(room_id.clone()).or_default().push(msg);

                // Unread count if not self and not currently viewing this room
                let is_self = sender == self.my_user;
                let viewing_this_room =
                    self.mode == Mode::RoomView && Some(&room_id) == self.current_room_id();
                if !is_self
                    && !viewing_this_room
                    && let Some(room) = self.rooms.iter_mut().find(|r| r.id == room_id)
                {
                    room.unread = room.unread.saturating_add(1);
                }
            }
        }
    }
}

async fn run_ui(
    sdk_client: &Client,
    hum_client: &HumClient,
    mut rx: mpsc::UnboundedReceiver<UiEvent>,
    app: &mut App,
) -> Result<()> {
    enable_raw_mode().map_err(Error::from)?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen).map_err(Error::from)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend).map_err(Error::from)?;

    let res = async {
        loop {
            // Drain incoming events
            while let Ok(ev) = rx.try_recv() {
                app.on_incoming(ev);
            }

            terminal.draw(|f| draw(f, app)).map_err(Error::from)?;

            if event::poll(Duration::from_millis(50))?
                && let CEvent::Key(key) = event::read()?
                && key.kind == KeyEventKind::Press
                && handle_key(sdk_client, hum_client, app, key.code).await?
            {
                break;
            }
        }
        anyhow::Ok(())
    }
    .await;

    // Restore terminal
    disable_raw_mode().map_err(Error::from)?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen).map_err(Error::from)?;
    terminal.show_cursor().map_err(Error::from)?;

    res?;
    Ok(())
}

fn draw(f: &mut ratatui::Frame, app: &App) {
    match app.mode {
        Mode::RoomList => draw_room_list(f, app),
        Mode::RoomView => draw_room_view(f, app),
    }
}

fn draw_room_list(f: &mut ratatui::Frame, app: &App) {
    let size = f.size();
    let items: Vec<ListItem> = app
        .rooms
        .iter()
        .map(|r| {
            let label = if r.unread > 0 {
                format!("[{}] {}", r.unread, r.name)
            } else {
                r.name.clone()
            };
            ListItem::new(label)
        })
        .collect();

    let list = List::new(items)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title("Hum Matrix - Rooms"),
        )
        .highlight_style(
            Style::default()
                .fg(Color::Yellow)
                .add_modifier(Modifier::BOLD),
        );

    f.render_stateful_widget(list, size, &mut list_state(app.selected));
}

fn list_state(selected: usize) -> ratatui::widgets::ListState {
    let mut state = ratatui::widgets::ListState::default();
    state.select(Some(selected));
    state
}

fn draw_room_view(f: &mut ratatui::Frame, app: &App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Min(1), Constraint::Length(3)].as_ref())
        .split(f.size());

    let room_id = match app.current_room_id() {
        Some(id) => id,
        None => return,
    };
    let msgs = app
        .messages
        .get(room_id)
        .map(|v| v.as_slice())
        .unwrap_or(&[]);

    // Show last N messages, with optional scrollback
    let height = chunks[0].height as usize;
    let start = msgs.len().saturating_sub(height + app.scroll);
    let end = msgs.len().saturating_sub(app.scroll);
    let lines: Vec<Line> = msgs[start..end]
        .iter()
        .map(|m| Line::from(Span::raw(format!("{}: {}", m.sender, m.body))))
        .collect();

    let messages = Paragraph::new(lines)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title(room_id.as_ref()),
        )
        .scroll((0, 0));

    let input = Paragraph::new(app.input.as_str()).block(
        Block::default()
            .borders(Borders::ALL)
            .title("Message (Enter to send, b to back)"),
    );

    f.render_widget(messages, chunks[0]);
    f.render_widget(input, chunks[1]);
}

async fn handle_key(
    _sdk_client: &Client,
    hum_client: &HumClient,
    app: &mut App,
    code: KeyCode,
) -> Result<bool> {
    match app.mode {
        Mode::RoomList => match code {
            KeyCode::Char('q') => return Ok(true),
            KeyCode::Up => {
                if app.selected > 0 {
                    app.selected -= 1;
                }
            }
            KeyCode::Down => {
                if app.selected + 1 < app.rooms.len() {
                    app.selected += 1;
                }
            }
            KeyCode::Enter => {
                app.mode = Mode::RoomView;
                app.scroll = 0;
                if let Some(room) = app.rooms.get_mut(app.selected) {
                    room.unread = 0;
                }
                // Load recent history for this room (first page)
                if let Some(room_id) = app.current_room_id().cloned() {
                    let (msgs, next_from) = hum_client
                        .fetch_recent_text_messages(room_id.as_ref(), None, 50)
                        .await?;
                    let entry = app.messages.entry(room_id.clone()).or_default();
                    entry.extend(msgs.into_iter().map(|m| Msg {
                        sender: m.sender.to_string(),
                        body: m.body,
                    }));
                    app.next_from.insert(room_id, next_from);
                }
            }
            _ => {}
        },
        Mode::RoomView => match code {
            KeyCode::Char('q') => return Ok(true),
            KeyCode::Esc | KeyCode::Char('b') => {
                app.mode = Mode::RoomList;
            }
            KeyCode::Up => {
                app.scroll = app.scroll.saturating_add(1);
            }
            KeyCode::Down => {
                app.scroll = app.scroll.saturating_sub(1);
            }
            KeyCode::PageUp => {
                // Try to load older messages when paging up
                if let Some(room_id) = app.current_room_id().cloned() {
                    let from = app.next_from.get(&room_id).and_then(|f| f.as_deref());
                    let (msgs, next_from) = hum_client
                        .fetch_recent_text_messages(room_id.as_ref(), from, 50)
                        .await?;
                    let entry = app.messages.entry(room_id.clone()).or_default();
                    // Prepend older messages
                    let new_msgs: Vec<Msg> = msgs
                        .into_iter()
                        .map(|m| Msg {
                            sender: m.sender.to_string(),
                            body: m.body,
                        })
                        .collect();
                    // Keep newest last; insert at front by rebuilding vector
                    let mut combined = new_msgs;
                    combined.append(entry);
                    *app.messages.entry(room_id.clone()).or_default() = combined;
                    app.next_from.insert(room_id, next_from);
                } else {
                    app.scroll = app.scroll.saturating_add(10);
                }
            }
            KeyCode::PageDown => {
                app.scroll = app.scroll.saturating_sub(10);
            }
            KeyCode::Backspace => {
                app.input.pop();
            }
            KeyCode::Enter => {
                if let Some(room_id) = app.current_room_id().cloned()
                    && !app.input.trim().is_empty()
                {
                    // Send the message
                    let body = app.input.clone();
                    hum_client.send_text(room_id.as_str(), &body).await?;
                    app.input.clear();
                }
            }
            KeyCode::Char(c) => {
                app.input.push(c);
            }
            _ => {}
        },
    }
    Ok(false)
}
