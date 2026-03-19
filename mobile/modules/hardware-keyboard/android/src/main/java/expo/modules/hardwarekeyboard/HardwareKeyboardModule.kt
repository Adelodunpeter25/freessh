package expo.modules.hardwarekeyboard

import android.view.KeyEvent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HardwareKeyboardModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HardwareKeyboard")

    Events("onKeyCommand")

    OnCreate {
      instances.add(this@HardwareKeyboardModule)
    }

    OnDestroy {
      instances.remove(this@HardwareKeyboardModule)
    }
  }

  companion object {
    private val instances = mutableListOf<HardwareKeyboardModule>()

    fun emitToAll(input: String, shift: Boolean, ctrl: Boolean = false, alt: Boolean = false) {
      val payload = mapOf(
        "input" to input,
        "shift" to shift,
        "ctrl" to ctrl,
        "alt" to alt
      )
      instances.forEach { instance ->
        instance.sendEvent("onKeyCommand", payload)
      }
    }

    fun handleKeyEvent(event: KeyEvent): Boolean {
      val keyCode = event.keyCode
      val shift = event.isShiftPressed
      val ctrl = event.isCtrlPressed
      val alt = event.isAltPressed

      // Handle special keys
      when (keyCode) {
        KeyEvent.KEYCODE_DPAD_UP -> {
          emitToAll("ArrowUp", shift, ctrl, alt)
          return true
        }
        KeyEvent.KEYCODE_DPAD_DOWN -> {
          emitToAll("ArrowDown", shift, ctrl, alt)
          return true
        }
        KeyEvent.KEYCODE_DPAD_LEFT -> {
          emitToAll("ArrowLeft", shift, ctrl, alt)
          return true
        }
        KeyEvent.KEYCODE_DPAD_RIGHT -> {
          emitToAll("ArrowRight", shift, ctrl, alt)
          return true
        }
        KeyEvent.KEYCODE_ESCAPE -> {
          emitToAll("Escape", shift, ctrl, alt)
          return true
        }
        KeyEvent.KEYCODE_DEL -> {
          // Backspace
          emitToAll("\b", shift, ctrl, alt)
          return true
        }
        KeyEvent.KEYCODE_FORWARD_DEL -> {
          // Delete
          emitToAll("delete", shift, ctrl, alt)
          return true
        }
        KeyEvent.KEYCODE_TAB -> {
          emitToAll("\t", shift, ctrl, alt)
          return true
        }
      }

      // Handle Ctrl key combinations
      if (ctrl && keyCode >= KeyEvent.KEYCODE_A && keyCode <= KeyEvent.KEYCODE_Z) {
        val char = ('a' + (keyCode - KeyEvent.KEYCODE_A)).toString()
        emitToAll(char, shift, ctrl, alt)
        return true
      }

      return false
    }
  }
}
