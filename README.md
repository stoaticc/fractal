# Fractal App - Rust WebView Application

A Rust application that serves the Fractal game using a local web server and displays it in a native webview window.

## Architecture

-   **index.html**: Embedded directly in the executable
-   **JavaScript files**: Served from `/lib/classes/` directory next to the executable
-   **Web Server**: Local Axum server running on `http://127.0.0.1:3030`
-   **WebView**: Native window using WRY (WebView Rendering library)

## Prerequisites

-   Rust (install from https://rustup.rs/)
-   Windows (for other platforms, WebView dependencies may differ)

## Build Instructions

1. Navigate to the app directory:

```powershell
cd app
```

2. Build the release version:

```powershell
cargo build --release
```

The executable will be created at: `app/target/release/fractal-app.exe`

## Running the Application

### Development Mode

From the `app` directory:

```powershell
cargo run
```

### Production Mode

1. After building, copy the executable to your desired location
2. Create a `lib` folder next to the executable
3. Copy the `classes` folder into the `lib` folder

Directory structure should be:

```
fractal-app.exe
lib/
  classes/
    Enemy.js
    EnemyProjectile.js
    Game.js
    index.js
    InputHandler.js
    Light.js
    Particle.js
    Player.js
    PowerUp.js
    Projectile.js
    ScreenShake.js
```

4. Run the executable:

```powershell
.\fractal-app.exe
```

## How It Works

1. The application embeds `index.html` at compile time
2. On startup, it launches a local web server (Axum) on port 3030
3. The server serves:
    - `/` - The embedded index.html
    - `/classes/*` - JavaScript files from the `lib/classes/` directory
4. A native webview window opens pointing to `http://127.0.0.1:3030`
5. The game runs in the native window

## Troubleshooting

-   **Port 3030 already in use**: Another application is using port 3030. Change the port in `src/main.rs`
-   **JavaScript files not loading**: Ensure the `lib/classes/` folder exists next to the executable
-   **Window doesn't open**: Check if WebView2 runtime is installed (Windows requirement)
