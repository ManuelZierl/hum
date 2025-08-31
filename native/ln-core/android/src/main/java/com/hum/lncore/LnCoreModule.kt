package com.hum.lncore

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LnCoreModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LnCore")

    AsyncFunction("ping") {
      "ok"
    }
  }
}

