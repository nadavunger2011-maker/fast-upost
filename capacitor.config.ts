import type { CapacitorConfig } from '@anthropic-ai/capacitor/cli';

const config: CapacitorConfig = {
  // ─── Core Identity ───
  appId: 'com.nadav.fastupost',
  appName: 'Fast uPost',
  webDir: 'dist',

  // ─── Server Config (local build, no remote URL) ───
  server: {
    // No url property = loads from local /dist
    androidScheme: 'https',          // Use https scheme for CORS/cookie compat
    allowNavigation: ['*.wordpress.com', '*.wp.com', '*'],  // Allow WP API calls
    cleartext: false,                // Block HTTP (force HTTPS)
  },

  // ─── Android-Specific ───
  android: {
    buildOptions: {
      keystorePath: 'release-key.jks',
      keystoreAlias: 'fastupost',
      // Password injected via env vars at build time (see build script)
    },
    allowMixedContent: false,         // Security: no HTTP resources in HTTPS pages
    captureInput: true,               // Better keyboard handling
    webContentsDebuggingEnabled: false, // DISABLE for production, enable for dev
    backgroundColor: '#0a0a0b',       // Match app theme — no white flash
    initialFocus: false,              // Prevent keyboard auto-open
    useLegacyBridge: false,           // Use modern Capacitor bridge
  },

  // ─── Plugins ───
  plugins: {
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#0a0a0b',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },

    // Status Bar
    StatusBar: {
      style: 'DARK',                   // Light icons on dark bg
      backgroundColor: '#0a0a0b',
      overlaysWebView: false,
    },

    // Keyboard
    Keyboard: {
      resize: 'body',                  // Resize body when keyboard opens
      resizeOnFullScreen: true,
    },

    // HTTP (for WP API calls without CORS issues)
    CapacitorHttp: {
      enabled: true,                   // Native HTTP bypasses CORS entirely
    },
  },
};

export default config;
