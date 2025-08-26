import ExpoModulesCore

public class LnCoreModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LnCore")

    AsyncFunction("ping") {
      "ok"
    }
  }
}
