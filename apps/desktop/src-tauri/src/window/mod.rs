//! The main window: where it loads from, what it may navigate to, and hide-on-close.

mod navigation;

use tauri::{
    webview::NewWindowResponse, AppHandle, Manager, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder, WindowEvent,
};
use tauri_plugin_opener::OpenerExt;
use url::Url;

use crate::config::MAIN_WINDOW;
use navigation::{is_in_app, is_openable_externally};

/// Smallest size at which the player shell still lays out (the design's compact breakpoint).
const MIN_SIZE: (f64, f64) = (960.0, 640.0);
const DEFAULT_SIZE: (f64, f64) = (1280.0, 800.0);

/// Opens the main window on `start` — the loopback origin in a release build, the Vite dev
/// server under `tauri dev`. The window-state plugin then restores its last size and position.
pub fn create_main_window(app: &AppHandle, start: Url) -> tauri::Result<WebviewWindow> {
    let origin = start.clone();
    let navigation_app = app.clone();
    let popup_app = app.clone();

    let window = WebviewWindowBuilder::new(app, MAIN_WINDOW, WebviewUrl::External(start))
        .title("Bitrate")
        .inner_size(DEFAULT_SIZE.0, DEFAULT_SIZE.1)
        .min_inner_size(MIN_SIZE.0, MIN_SIZE.1)
        .on_navigation(move |target| {
            if is_in_app(target, &origin) {
                return true;
            }
            open_externally(&navigation_app, target);
            false
        })
        .on_new_window(move |target, _features| {
            open_externally(&popup_app, &target);
            NewWindowResponse::Deny
        })
        .build()?;

    hide_instead_of_closing(&window);
    Ok(window)
}

/// Shows, unminimises and focuses the main window (tray click, second launch, deep link).
pub fn show_main_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window(MAIN_WINDOW) else {
        return;
    };
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
}

/// Closing the window hides it: playback continues and the tray brings it back. Quitting is the
/// tray's "Quit" (or the OS quit shortcut on macOS).
fn hide_instead_of_closing(window: &WebviewWindow) {
    let hidden = window.clone();
    window.on_window_event(move |event| {
        if let WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            let _ = hidden.hide();
        }
    });
}

fn open_externally(app: &AppHandle, target: &Url) {
    if !is_openable_externally(target) {
        eprintln!("bitrate: blocked navigation to a {} URL", target.scheme());
        return;
    }
    if let Err(error) = app.opener().open_url(target.as_str(), None::<&str>) {
        eprintln!("bitrate: could not open the link in the browser: {error}");
    }
}
