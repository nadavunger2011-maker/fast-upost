package com.nadav.fastupost;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register plugins BEFORE super.onCreate
        // registerPlugin(com.example.MyPlugin.class);

        super.onCreate(savedInstanceState);

        // ─── Fullscreen Immersive Mode ───
        enableImmersiveMode();

        // ─── Keep screen on during active use ───
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // ─── Optimize WebView (runs after bridge init) ───
        optimizeWebView();
    }

    /**
     * Fullscreen immersive — hides nav bar and status bar.
     * Content renders edge-to-edge like a native app.
     */
    private void enableImmersiveMode() {
        // Edge-to-edge display
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ approach
            getWindow().setDecorFitsSystemWindows(false);
        }

        // Set dark status/nav bar backgrounds
        getWindow().setStatusBarColor(0xFF0A0A0B);
        getWindow().setNavigationBarColor(0xFF0A0A0B);

        // Light status bar icons = false (we want light icons on dark bg)
        View decorView = getWindow().getDecorView();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
        }
    }

    /**
     * WebView performance tuning.
     */
    private void optimizeWebView() {
        // Delay to ensure bridge has created the WebView
        getBridge().getWebView().post(() -> {
            WebView webView = getBridge().getWebView();
            if (webView == null) return;

            WebSettings settings = webView.getSettings();

            // ─── Performance ───
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setDomStorageEnabled(true);             // localStorage / sessionStorage
            settings.setDatabaseEnabled(true);               // IndexedDB
            settings.setJavaScriptEnabled(true);             // Required
            settings.setJavaScriptCanOpenWindowsAutomatically(false);

            // ─── Rendering ───
            settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
            settings.setUseWideViewPort(false);              // Prevent desktop-like viewport
            settings.setLoadWithOverviewMode(false);
            settings.setSupportZoom(false);                  // Disable pinch zoom
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);

            // ─── Media ───
            settings.setMediaPlaybackRequiresUserGesture(false); // Autoplay for embeds
            settings.setAllowFileAccess(true);               // File uploads
            settings.setAllowContentAccess(true);

            // ─── Network ───
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            settings.setBlockNetworkImage(false);

            // ─── Text ───
            settings.setTextZoom(100);                       // Prevent system font scaling
            settings.setDefaultTextEncodingName("UTF-8");

            // ─── Disable overscroll glow (pull-to-refresh visual) ───
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

            // ─── Hardware acceleration ───
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

            // ─── Background color to prevent white flash ───
            webView.setBackgroundColor(0xFF0A0A0B);
        });
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            enableImmersiveMode();
        }
    }
}
