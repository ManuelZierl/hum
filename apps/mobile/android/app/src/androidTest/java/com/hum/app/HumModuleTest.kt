package com.hum.app

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.ext.junit.rules.ActivityScenarioRule
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.bridge.PromiseImpl
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactContext
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

@RunWith(AndroidJUnit4::class)
class HumModuleTest {

  // Use the real MainActivity; no custom HarnessActivity needed
  @get:Rule
  val activityRule = ActivityScenarioRule(MainActivity::class.java)

  @Test
  fun humNativeModuleReturnsFalse() {
    val result = AtomicReference<Boolean?>()
    val latch = CountDownLatch(1)

    activityRule.scenario.onActivity { activity ->
      val app = activity.application as ReactApplication
      val manager = app.reactNativeHost.reactInstanceManager

      fun callModule(ctx: ReactContext) {
        val module = ctx.getNativeModule(com.hum.nativepkg.HumNativeModule::class.java)
        val resolveCb = Callback { args: Array<out Any?>? ->
          result.set(args?.getOrNull(0) as? Boolean)
          latch.countDown()
        }
        val rejectCb = Callback { _ ->
          latch.countDown()
        }
        val promise = PromiseImpl(resolveCb, rejectCb)
        module?.clientIsAuthenticated(0.0, promise)
      }

      manager.addReactInstanceEventListener(object : ReactInstanceEventListener {
        override fun onReactContextInitialized(context: ReactContext) = callModule(context)
      })
      manager.currentReactContext?.let { callModule(it) }
    }

    assertTrue("native call timed out", latch.await(10, TimeUnit.SECONDS))
    assertEquals(false, result.get())
  }
}
