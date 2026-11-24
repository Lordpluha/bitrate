//! Events the shell pushes to the renderer. The names and payloads are the contract with
//! `src/native/nativeEvents.ts`; change both sides together.

use tauri::{AppHandle, Emitter, Manager};

use crate::config::MAIN_WINDOW;

const PLAYBACK_EVENT: &str = "bitrate://playback";
const NAVIGATE_EVENT: &str = "bitrate://navigate";

/// A tray playback command; serialised as the renderer's `PlaybackCommand`.
#[derive(Clone, Copy, Debug, serde::Serialize)]
#[serde(rename_all = "lowercase")]
pub enum PlaybackCommand {
    Toggle,
    Next,
    Previous,
}

/// Sends a playback command to the main window's player.
pub fn emit_playback(app: &AppHandle, command: PlaybackCommand) {
    if let Err(error) = app.emit_to(MAIN_WINDOW, PLAYBACK_EVENT, command) {
        eprintln!("bitrate: could not send playback command: {error}");
    }
}

/// Navigates the renderer to an in-app path (already validated) and brings the window up.
pub fn emit_navigate(app: &AppHandle, path: &str) {
    crate::window::show_main_window(app);
    if app.get_webview_window(MAIN_WINDOW).is_none() {
        return;
    }
    if let Err(error) = app.emit_to(MAIN_WINDOW, NAVIGATE_EVENT, path) {
        eprintln!("bitrate: could not send deep link: {error}");
    }
}
