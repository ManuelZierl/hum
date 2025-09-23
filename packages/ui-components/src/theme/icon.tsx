import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from './theme-provider';

import ArchiveIcon from '../../../../assets/icons/archive.svg';
import ArrowLeftRightIcon from '../../../../assets/icons/arrow-left-right.svg';
import BellIcon from '../../../../assets/icons/bell.svg';
import BoxIcon from '../../../../assets/icons/box.svg';
import BriefcaseIcon from '../../../../assets/icons/briefcase.svg';
import BroadcastIcon from '../../../../assets/icons/broadcast.svg';
import BitcoinIcon from '../../../../assets/icons/bitcoin.svg';
import BitcoinOutlineIcon from '../../../../assets/icons/bitcoin-outline.svg';
import CallIncomingIcon from '../../../../assets/icons/call_incoming.svg';
import CallOutgoingIcon from '../../../../assets/icons/call_outgoing.svg';
import CallMissedIcon from '../../../../assets/icons/call_missed.svg';
import CameraIcon from '../../../../assets/icons/camera.svg';
import CameraVideoIcon from '../../../../assets/icons/camera-video.svg';
import ChatIcon from '../../../../assets/icons/chat.svg';
import ChatFillIcon from '../../../../assets/icons/chat-fill.svg';
import ClockIcon from '../../../../assets/icons/clock.svg';
import CompassIcon from '../../../../assets/icons/compass.svg';
import CreditCardIcon from '../../../../assets/icons/credit-card.svg';
import EmojiSmileIcon from '../../../../assets/icons/emoji-smile.svg';
import EnvelopeIcon from '../../../../assets/icons/envelope.svg';
import FileTextIcon from '../../../../assets/icons/file-text.svg';
import GearIcon from '../../../../assets/icons/gear.svg';
import GearFillIcon from '../../../../assets/icons/gear-fill.svg';
import GlobeIcon from '../../../../assets/icons/globe.svg';
import ImageIcon from '../../../../assets/icons/image.svg';
import LightningIcon from '../../../../assets/icons/lightning.svg';
import LockIcon from '../../../../assets/icons/lock.svg';
import MicIcon from '../../../../assets/icons/mic.svg';
import PaletteIcon from '../../../../assets/icons/palette.svg';
import PeopleIcon from '../../../../assets/icons/people.svg';
import PersonIcon from '../../../../assets/icons/person.svg';
import QuestionCircleIcon from '../../../../assets/icons/question-circle.svg';
import QrCodeIcon from '../../../../assets/icons/qr-code.svg';
import ReceiptIcon from '../../../../assets/icons/receipt.svg';
import SaveIcon from '../../../../assets/icons/save.svg';
import SearchIcon from '../../../../assets/icons/search.svg';
import ShieldIcon from '../../../../assets/icons/shield.svg';
import TelephoneIcon from '../../../../assets/icons/telephone.svg';
import TelephoneFillIcon from '../../../../assets/icons/telephone-fill.svg';
import TrashIcon from '../../../../assets/icons/trash.svg';
import VolumeUpIcon from '../../../../assets/icons/volume-up.svg';
import WalletIcon from '../../../../assets/icons/wallet.svg';
import VideoCallIcon from '../../../../assets/icons/video_call.svg';

const icons = {
  archive: ArchiveIcon,
  'arrow-left-right': ArrowLeftRightIcon,
  bell: BellIcon,
  box: BoxIcon,
  briefcase: BriefcaseIcon,
  broadcast: BroadcastIcon,
  bitcoin: BitcoinIcon,
  'bitcoin-outline': BitcoinOutlineIcon,
  call_incoming: CallIncomingIcon,
  call_outgoing: CallOutgoingIcon,
  call_missed: CallMissedIcon,
  camera: CameraIcon,
  'camera-video': CameraVideoIcon,
  chat: ChatIcon,
  'chat-fill': ChatFillIcon,
  clock: ClockIcon,
  compass: CompassIcon,
  'credit-card': CreditCardIcon,
  'emoji-smile': EmojiSmileIcon,
  envelope: EnvelopeIcon,
  'file-text': FileTextIcon,
  gear: GearIcon,
  'gear-fill': GearFillIcon,
  globe: GlobeIcon,
  image: ImageIcon,
  lightning: LightningIcon,
  lock: LockIcon,
  mic: MicIcon,
  palette: PaletteIcon,
  people: PeopleIcon,
  person: PersonIcon,
  'question-circle': QuestionCircleIcon,
  'qr-code': QrCodeIcon,
  receipt: ReceiptIcon,
  save: SaveIcon,
  search: SearchIcon,
  shield: ShieldIcon,
  telephone: TelephoneIcon,
  'telephone-fill': TelephoneFillIcon,
  trash: TrashIcon,
  'volume-up': VolumeUpIcon,
  video_call: VideoCallIcon,
  wallet: WalletIcon,
};

export type IconName = keyof typeof icons;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 24, color, style }: IconProps) {
  const { colors } = useTheme();
  const Component = icons[name];
  const flattened = style ? StyleSheet.flatten(style) : undefined;
  return (
    <Component
      width={size}
      height={size}
      fill={color ?? colors.foreground}
      color={color ?? colors.foreground}
      style={StyleSheet.flatten([styles.icon, flattened])}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    overflow: 'visible',
  },
});

export default Icon;
