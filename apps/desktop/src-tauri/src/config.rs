//! Build-time configuration of the native shell.

/// The API every renderer request is forwarded to. Set `BITRATE_API_URL` when building a
/// release (`BITRATE_API_URL=https://api.example.com pnpm tauri build`); local builds talk to
/// the API on its default dev port.
pub fn api_base_url() -> &'static str {
    option_env!("BITRATE_API_URL")
        .unwrap_or("http://localhost:3000")
        .trim_end_matches('/')
}

/// Loopback ports tried in order for the renderer's origin.
///
/// The port is part of the origin, and the origin owns `localStorage` (theme, player session,
/// settings), so a fixed first choice keeps that state across launches. The fallbacks only
/// matter when another program already holds the first port.
pub const LOOPBACK_PORTS: [u16; 6] = [47810, 47811, 47812, 47813, 47814, 47815];

/// The route the window opens on: the player shell. Signed-out users are sent to login by the
/// renderer's own auth handling.
pub const START_PATH: &str = "/main";

/// Label of the one main window; capabilities and the window-state plugin key on it.
pub const MAIN_WINDOW: &str = "main";
