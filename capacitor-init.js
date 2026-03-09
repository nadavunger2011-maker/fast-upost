/**
 * capacitor-init.js
 * 
 * Import this file in your web app's entry point (e.g., main.js / index.html).
 * It initializes all native Capacitor plugins and behaviors.
 * 
 * Usage:
 *   <script type="module" src="./capacitor-init.js"></script>
 *   — OR —
 *   import './capacitor-init.js';
 */

import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

// ═══════════════════════════════════════════
// Only run native code on actual devices
// ═══════════════════════════════════════════
const isNative = Capacitor.isNativePlatform();

async function initApp() {
  if (!isNative) {
    console.log('[Capacitor] Running in browser — native plugins skipped');
    return;
  }

  console.log('[Capacitor] Initializing native plugins...');

  // ─── 1. Status Bar ───
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0a0a0b' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (e) {
    console.warn('[StatusBar]', e);
  }

  // ─── 2. Splash Screen ───
  // Auto-hide is configured in capacitor.config.ts (1500ms)
  // But we can also manually hide after our app is ready:
  try {
    // Give the WebView time to render, then hide splash
    setTimeout(async () => {
      await SplashScreen.hide({ fadeOutDuration: 300 });
    }, 800);
  } catch (e) {
    console.warn('[SplashScreen]', e);
  }

  // ─── 3. Android Back Button ───
  // Handle hardware back button: go back in history or exit app
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      // If on root view, minimize app (don't kill it)
      App.minimizeApp();
    }
  });

  // ─── 4. App State Listener ───
  // Resume: re-check connection when app comes to foreground
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      console.log('[App] Resumed — checking connectivity');
      // Dispatch a custom event your app can listen to
      window.dispatchEvent(new CustomEvent('app-resumed'));
    }
  });

  // ─── 5. Keyboard Adjustments ───
  try {
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.setProperty('--keyboard-height', '0px');
      document.body.classList.remove('keyboard-open');
    });
  } catch (e) {
    console.warn('[Keyboard]', e);
  }

  console.log('[Capacitor] Native init complete');
}

// ═══════════════════════════════════════════
// Disable pull-to-refresh (overscroll)
// ═══════════════════════════════════════════
function disablePullToRefresh() {
  let startY = 0;

  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    const scrollTop = document.scrollingElement?.scrollTop || 0;

    // If at top of page and pulling down, prevent overscroll
    if (scrollTop <= 0 && y > startY) {
      e.preventDefault();
    }
  }, { passive: false });

  // CSS-based prevention as well
  document.documentElement.style.overscrollBehavior = 'none';
  document.body.style.overscrollBehavior = 'none';
}

// ═══════════════════════════════════════════
// Haptic feedback helper (use throughout app)
// ═══════════════════════════════════════════
export async function hapticTap() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) {}
}

export async function hapticSuccess() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (e) {}
}

export async function hapticError() {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (e) {}
}

// ═══════════════════════════════════════════
// Boot
// ═══════════════════════════════════════════
disablePullToRefresh();
initApp();
