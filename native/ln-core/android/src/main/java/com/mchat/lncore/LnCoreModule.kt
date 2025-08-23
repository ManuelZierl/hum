package com.mchat.lncore

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.delay
import java.util.UUID

class LnCoreModule : Module() {
  private val payments = mutableListOf<MutableMap<String, Any>>()
  private var network: String = "testnet"

  override fun definition() = ModuleDefinition {
    Name("LnCore")
    Events("PaymentUpdated")

    AsyncFunction("init") { opts: Map<String, Any>? ->
      opts?.get("network")?.let { network = it as String }
      mapOf("ok" to true)
    }

    AsyncFunction("isReady") { true }

    AsyncFunction("nodeInfo") {
      mapOf(
        "pubkey" to "02aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "alias" to "MockNode",
        "connected" to false
      )
    }

    AsyncFunction("createInvoice") { params: Map<String, Any> ->
      val amount = (params["amountSats"] as? Number)?.toLong() ?: 0L
      val memo = params["memo"] as? String
      val id = UUID.randomUUID().toString()
      val prefix = when (network) {
        "mainnet" -> "lnbc"
        "signet" -> "lntbs"
        else -> "lntb"
      }
      val bolt11 = "${prefix}1mock${id.take(8)}"
      val payment = mutableMapOf<String, Any>(
        "id" to id,
        "bolt11" to bolt11,
        "status" to "pending",
        "amountSats" to amount,
        "timestamp" to System.currentTimeMillis() / 1000
      )
      payments.add(payment)
      mutableMapOf<String, Any>("bolt11" to bolt11, "amountSats" to amount).apply {
        memo?.let { put("memo", it) }
      }
    }

    AsyncFunction("payInvoice") { bolt11: String ->
      val payment = payments.find { it["bolt11"] == bolt11 }
      val id = payment?.get("id") as? String ?: UUID.randomUUID().toString()
      sendEvent("PaymentUpdated", mapOf("id" to id, "status" to "pending"))
      delay((300..800).random().toLong())
      payment?.set("status", "succeeded")
      sendEvent("PaymentUpdated", mapOf("id" to id, "status" to "succeeded"))
      mapOf("preimage" to "a".repeat(64), "feesSats" to 1)
    }

    AsyncFunction("estimateFees") { _: String ->
      mapOf("maxFeesSats" to 1)
    }

    AsyncFunction("listPayments") { payments.toList() }
  }
}
