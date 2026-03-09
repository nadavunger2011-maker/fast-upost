# Fast uPost — Android Build Guide

Complete instructions to wrap your web app into a production Android app using Capacitor 6.

---

## Prerequisites

Install these before starting:

```bash
# Node.js 18+ (check with: node -v)
# Java 17 JDK
brew install openjdk@17          # macOS
# sudo apt install openjdk-17-jdk  # Ubuntu/Debian

# Android Studio (required for SDK + build tools)
# Download from: https://developer.android.com/studio
# After install, open Android Studio → SDK Manager → Install:
#   - Android SDK Platform 34
#   - Android SDK Build-Tools 34
#   - Android SDK Command-line Tools
#   - Android Emulator (optional)

# Set environment variables (add to ~/.zshrc or ~/.bashrc):
export JAVA_HOME=$(/usr/libexec/java_home -v 17)     # macOS
export ANDROID_HOME=$HOME/Library/Android/sdk          # macOS
# export ANDROID_HOME=$HOME/Android/Sdk                # Linux
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

---

## Step 1: Project Setup

Start from your existing web project directory (the one with your `/dist` folder):

```bash
# Copy the generated files into your project root:
#   - capacitor.config.ts
#   - package.json (merge dependencies if you already have one)
#   - src/capacitor-init.js

# Install dependencies
npm install

# Install Capacitor plugins
npm install @capacitor/core @capacitor/cli @capacitor/android \
  @capacitor/app @capacitor/haptics @capacitor/keyboard \
  @capacitor/splash-screen @capacitor/status-bar
```

---

## Step 2: Build Your Web App

```bash
# Build your web app to /dist
# This depends on your build tool:
npm run build          # Vite / Webpack / etc.

# Verify /dist exists and contains your index.html
ls dist/index.html
```

---

## Step 3: Add Capacitor Init to Your Web App

Add this to your web app's entry point. If using the single HTML file from our earlier
WordPress dashboard, add before the closing `</body>` tag:

```html
<script type="module" src="./capacitor-init.js"></script>
```

Or if using a bundler (Vite/Webpack), import it in your main.js:

```javascript
import './capacitor-init.js';
```

Then rebuild: `npm run build`

---

## Step 4: Initialize Capacitor + Add Android

```bash
# Initialize Capacitor (skip if capacitor.config.ts already exists)
npx cap init "Fast uPost" com.nadav.fastupost --web-dir dist

# Add Android platform
npx cap add android

# Sync web assets to Android project
npx cap sync android
```

---

## Step 5: Apply Custom Android Files

After `npx cap add android` creates the `android/` directory, copy the override files:

```bash
# 1. Replace MainActivity.java
cp android-overrides/MainActivity.java \
   android/app/src/main/java/com/nadav/fastupost/MainActivity.java

# 2. Replace AndroidManifest.xml
cp android-overrides/AndroidManifest.xml \
   android/app/src/main/AndroidManifest.xml

# 3. Copy resource files
cp android-overrides/res/values/styles.xml \
   android/app/src/main/res/values/styles.xml

cp android-overrides/res/values/colors.xml \
   android/app/src/main/res/values/colors.xml

cp android-overrides/res/drawable/splash.xml \
   android/app/src/main/res/drawable/splash.xml

# 4. Create XML config directory and copy files
mkdir -p android/app/src/main/res/xml/
cp android-overrides/res/xml/network_security_config.xml \
   android/app/src/main/res/xml/network_security_config.xml
cp android-overrides/res/xml/file_paths.xml \
   android/app/src/main/res/xml/file_paths.xml

# 5. Copy adaptive icon configs
mkdir -p android/app/src/main/res/mipmap-anydpi-v26/
cp android-overrides/res/mipmap-anydpi-v26/ic_launcher.xml \
   android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
cp android-overrides/res/mipmap-anydpi-v26/ic_launcher_round.xml \
   android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml

# 6. Copy ProGuard rules
cp android-overrides/proguard-rules.pro \
   android/app/proguard-rules.pro
```

---

## Step 6: Generate App Icons

```bash
# Option A: Use the script (requires ImageMagick)
chmod +x generate-icons.sh
./generate-icons.sh your-icon-1024x1024.png

# Option B: Use Android Studio
# Open android/ in Android Studio
# Right-click res → New → Image Asset
# Select your 1024x1024 source icon
# It generates all densities automatically

# Option C: Use https://icon.kitchen (online tool)
# Upload your icon, download the zip, extract to res/mipmap-*/
```

---

## Step 7: Configure Signing Key (Required for Release)

```bash
# Generate a release keystore (DO THIS ONCE, KEEP FOREVER)
keytool -genkeypair -v \
  -keystore release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias fastupost \
  -storepass YOUR_SECURE_PASSWORD \
  -keypass YOUR_SECURE_PASSWORD \
  -dname "CN=Nadav, O=FastUPost, L=Tel Aviv, C=IL"

# Create keystore.properties in android/
cp android-overrides/keystore.properties android/keystore.properties

# Edit android/keystore.properties with your actual passwords
nano android/keystore.properties
```

> ⚠️ **CRITICAL**: Back up `release-key.jks` somewhere safe. If you lose it,
> you can NEVER update your app on Google Play.

---

## Step 8: Merge Gradle Build Config

Open `android/app/build.gradle` and add the signing config from
`android-overrides/build.gradle.overlay`. The key sections to add are:

1. **Keystore loading** at the top of the file
2. **signingConfigs** block inside `android {}`
3. **release buildType** modifications (minify, shrink, signing)
4. **compileOptions** for Java 17

See `build.gradle.overlay` for the exact code blocks.

---

## Step 9: Test on Device/Emulator

```bash
# Sync latest web build
npm run build
npx cap sync android

# Option A: Open in Android Studio (recommended for first run)
npx cap open android
# Then click ▶ Run in Android Studio

# Option B: Run directly from terminal
npx cap run android

# Option C: Run on connected device
npx cap run android --target=YOUR_DEVICE_ID
# List devices: adb devices
```

---

## Step 10: Build Release APK

```bash
# Full pipeline: build web → sync → assemble APK
npm run build
npx cap sync android
cd android
./gradlew assembleRelease

# Output APK location:
# android/app/build/outputs/apk/release/fast-upost-*-release.apk
```

---

## Step 11: Build Release AAB (for Google Play)

```bash
# Full pipeline: build web → sync → bundle AAB
npm run build
npx cap sync android
cd android
./gradlew bundleRelease

# Output AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## Step 12: Upload to Google Play

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app → Fill in details
3. Go to **Release → Production → Create new release**
4. Upload the `.aab` file from Step 11
5. Fill in release notes
6. Submit for review

### Required Play Store Assets:
- App icon: 512×512 PNG
- Feature graphic: 1024×500 PNG
- Screenshots: minimum 2, recommended phone + tablet
- Privacy policy URL
- Short description (80 chars)
- Full description (4000 chars)

---

## Project Structure (Final)

```
your-project/
├── dist/                          ← Your built web app
│   ├── index.html
│   ├── capacitor-init.js
│   └── ...
├── src/
│   ├── capacitor-init.js          ← Native plugin initialization
│   └── ...                        ← Your web app source
├── android/                       ← Generated by Capacitor
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/nadav/fastupost/
│   │   │   │   └── MainActivity.java     ← Custom (WebView optimized)
│   │   │   ├── res/
│   │   │   │   ├── drawable/
│   │   │   │   │   └── splash.xml        ← Splash screen
│   │   │   │   ├── mipmap-*/             ← App icons (all densities)
│   │   │   │   ├── mipmap-anydpi-v26/    ← Adaptive icon configs
│   │   │   │   ├── values/
│   │   │   │   │   ├── styles.xml        ← Theme (dark, no flash)
│   │   │   │   │   └── colors.xml        ← Color definitions
│   │   │   │   └── xml/
│   │   │   │       ├── network_security_config.xml
│   │   │   │       └── file_paths.xml
│   │   │   └── AndroidManifest.xml       ← Custom (permissions)
│   │   ├── build.gradle                  ← With signing + minify
│   │   └── proguard-rules.pro            ← WebView/Capacitor rules
│   ├── keystore.properties               ← Signing credentials
│   └── ...
├── android-overrides/             ← Template files (this package)
├── capacitor.config.ts            ← Capacitor configuration
├── package.json                   ← Dependencies + scripts
├── release-key.jks                ← Signing key (DO NOT COMMIT)
├── generate-icons.sh              ← Icon generation script
└── .gitignore
```

---

## Quick Command Reference

| Task | Command |
|---|---|
| Build web + sync | `npm run build && npx cap sync android` |
| Open in Android Studio | `npx cap open android` |
| Run on device | `npx cap run android` |
| Debug APK | `cd android && ./gradlew assembleDebug` |
| Release APK | `cd android && ./gradlew assembleRelease` |
| Release AAB (Play Store) | `cd android && ./gradlew bundleRelease` |
| List devices | `adb devices` |
| Install APK manually | `adb install app-release.apk` |
| View logs | `adb logcat \| grep -i capacitor` |
| Clean build | `cd android && ./gradlew clean` |

---

## Troubleshooting

### White flash on startup
→ Check that `styles.xml` has `android:windowBackground` set to `#0a0a0b`
→ Check that `MainActivity.java` sets `webView.setBackgroundColor(0xFF0A0A0B)`

### CORS errors when calling WordPress API
→ Capacitor's native HTTP plugin is enabled in the config
→ The app makes requests natively, bypassing browser CORS entirely
→ If still failing, check `network_security_config.xml`

### Build fails with signing error
→ Verify `keystore.properties` paths and passwords
→ Ensure `release-key.jks` exists at the specified path

### WebView is slow
→ Hardware acceleration is enabled in `MainActivity.java`
→ Verify `android:hardwareAccelerated="true"` in `AndroidManifest.xml`
→ Check that R8/ProGuard isn't stripping needed classes

### Back button exits app immediately
→ `capacitor-init.js` handles this — checks `canGoBack` before minimizing
→ Verify the script is included in your `/dist` build

### File upload doesn't work
→ Check `file_paths.xml` exists in `res/xml/`
→ Verify `FileProvider` is in `AndroidManifest.xml`
→ Check `READ_MEDIA_IMAGES` permission is declared
