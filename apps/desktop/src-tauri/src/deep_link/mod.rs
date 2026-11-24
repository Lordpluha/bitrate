//! `bitrate://` links: registering the scheme and routing opened links into the renderer.

mod route;

use tauri::{AppHandle, Manager};
use tauri_plugin_deep_link::DeepLinkExt;
use url::Url;

pub use route::deep_link_path;

use crate::events::emit_navigate;

/// The in-app path of the link the app was launched with, if it was launched by one.
pub fn launch_path(app: &AppHandle) -> Option<String> {
    let links = app.deep_link().get_current().ok().flatten()?;
    links.iter().find_map(deep_link_path)
}

/// Routes every link opened while the app runs (a second launch included, through the
/// single-instance plugin) to the renderer.
pub fn listen(app: &AppHandle) {
    /* Installed builds register the scheme through the bundle; a dev or AppImage run on Linux
    and Windows has to register it at runtime. */
    #[cfg(any(windows, target_os = "linux"))]
    if let Err(error) = app.deep_link().register_all() {
        eprintln!("bitrate: could not register bitrate:// links: {error}");
    }

    let handle = app.app_handle().clone();
    app.deep_link().on_open_url(move |event| {
        if let Some(path) = event.urls().iter().find_map(open_path) {
            emit_navigate(&handle, &path);
        }
    });
}

fn open_path(link: &Url) -> Option<String> {
    let path = deep_link_path(link);
    if path.is_none() {
        eprintln!("bitrate: ignored a link outside the allowlist");
    }
    path
}
