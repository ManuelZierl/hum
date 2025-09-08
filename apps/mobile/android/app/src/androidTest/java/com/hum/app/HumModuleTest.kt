package com.hum.app

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.ext.junit.rules.ActivityScenarioRule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.ReactInstanceEventListener
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class HumModuleTest {
  @get:Rule
  val activityRule = ActivityScenarioRule(HarnessActivity::class.java)

  @Test
  fun humNativeModuleReturnsFalse() {
    val result = AtomicReference<Boolean>()
    val latch = CountDownLatch(1)

    activityRule.scenario.onActivity { activity ->
      val manager = activity.reactNativeHost.reactInstanceManager
      val callModule = { context: ReactContext ->
        val module = context.getNativeModule(com.hum.nativepkg.HumNativeModule::class.java)
        module?.clientIsAuthenticated(0.0, object : Promise {
          override fun resolve(value: Any?) {
            result.set(value as? Boolean)
            latch.countDown()
          }
          override fun reject(code: String?, message: String?) { latch.countDown() }
          override fun reject(code: String?, throwable: Throwable?) { latch.countDown() }
          override fun reject(code: String?, message: String?, throwable: Throwable?) { latch.countDown() }
          override fun reject(throwable: Throwable?) { latch.countDown() }
          override fun reject(throwable: Throwable?, userInfo: WritableMap?) { latch.countDown() }
          override fun reject(code: String?, userInfo: WritableMap?) { latch.countDown() }
          override fun reject(code: String?, message: String?, throwable: Throwable?, userInfo: WritableMap?) { latch.countDown() }
        })
      }
      manager.addReactInstanceEventListener(object : ReactInstanceEventListener {
        override fun onReactContextInitialized(context: ReactContext) {
          callModule(context)
        }
      })
      manager.currentReactContext?.let { callModule(it) }
    }

    assertTrue(latch.await(5, TimeUnit.SECONDS))
    assertEquals(false, result.get())
  }
}
