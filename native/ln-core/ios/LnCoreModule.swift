import ExpoModulesCore
import Foundation

public class LnCoreModule: Module {
  private var payments: [[String: Any]] = []
  private var network: String = "testnet"

  public func definition() -> ModuleDefinition {
    Name("LnCore")
    Events("PaymentUpdated")

    AsyncFunction("init") { (opts: [String: Any]?) -> [String: Bool] in
      if let net = opts?["network"] as? String {
        self.network = net
      }
      return ["ok": true]
    }

    AsyncFunction("isReady") { true }

    AsyncFunction("nodeInfo") {
      [
        "pubkey": "02aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "alias": "MockNode",
        "connected": false
      ]
    }

    AsyncFunction("createInvoice") { (params: [String: Any]) -> [String: Any] in
      let amount = params["amountSats"] as? Int ?? 0
      let memo = params["memo"] as? String
      let id = UUID().uuidString
      let prefix: String
      switch self.network {
      case "mainnet": prefix = "lnbc"
      case "signet": prefix = "lntbs"
      default: prefix = "lntb"
      }
      let bolt11 = "\(prefix)1mock\(id.prefix(8))"
      let payment: [String: Any] = [
        "id": id,
        "bolt11": bolt11,
        "status": "pending",
        "amountSats": amount,
        "timestamp": Int(Date().timeIntervalSince1970)
      ]
      self.payments.append(payment)
      var invoice: [String: Any] = ["bolt11": bolt11, "amountSats": amount]
      if let memo = memo { invoice["memo"] = memo }
      return invoice
    }

    AsyncFunction("payInvoice") { (bolt11: String, promise: Promise) in
      guard let index = self.payments.firstIndex(where: { ($0["bolt11"] as? String) == bolt11 }) else {
        promise.reject("", "Unknown invoice", nil)
        return
      }
      let id = self.payments[index]["id"] as! String
      self.sendEvent("PaymentUpdated", ["id": id, "status": "pending"])
      let delay = DispatchTime.now() + .milliseconds(Int.random(in: 300...800))
      DispatchQueue.main.asyncAfter(deadline: delay) {
        self.payments[index]["status"] = "succeeded"
        self.sendEvent("PaymentUpdated", ["id": id, "status": "succeeded"])
        promise.resolve(["preimage": String(repeating: "a", count: 64), "feesSats": 1])
      }
    }

    AsyncFunction("estimateFees") { (_: String) -> [String: Int] in
      ["maxFeesSats": 1]
    }

    AsyncFunction("listPayments") { self.payments }
  }
}
