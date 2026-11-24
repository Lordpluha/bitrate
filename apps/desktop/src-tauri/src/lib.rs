//! Bitrate desktop: a native window around the web-player renderer, with a tray, a single
//! instance, remembered window state and `bitrate://` links.

mod config;
mod deep_link;
mod events;
mod server;
mod tray;
mod window;

use tauri::{App, AppHandle, RunEvent};
use url::Url;

use config::START_PATH;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // First, so a second launch is caught before any other plugin initialises.
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            window::show_main_window(app);
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .setup(setup)
        .build(tauri::generate_context!())
        .expect("error while building the Bitrate desktop app")
        .run(on_run_event);
}

fn setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle();
    let start = start_url(handle)?;

    window::create_main_window(handle, start)?;
    tray::create_tray(handle)?;
    deep_link::listen(handle);
    Ok(())
}

/// Where the window opens: the Vite dev server under `tauri dev`, otherwise the loopback
/// server; on the path of the link the app was launched with, if any.
fn start_url(app: &AppHandle) -> Result<Url, Box<dyn std::error::Error>> {
    let origin = match app
        .config()
        .build
        .dev_url
        .clone()
        .filter(|_| tauri::is_dev())
    {
        Some(dev_url) => dev_url,
        None => Url::parse(&format!("http://127.0.0.1:{}/", server::start(app)?))?,
    };
    let path = deep_link::launch_path(app).unwrap_or_else(|| START_PATH.to_owned());
    Ok(origin.join(&path)?)
}

/// macOS: clicking the Dock icon of a running app with its window hidden shows the window.
fn on_run_event(app: &AppHandle, event: RunEvent) {
    #[cfg(target_os = "macos")]
    if let RunEvent::Reopen { .. } = event {
        window::show_main_window(app);
    }
    #[cfg(not(target_os = "macos"))]
    let _ = (app, event);
}
