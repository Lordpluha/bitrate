//! The tray icon: the way back to a hidden window, quick playback controls, and Quit.

use tauri::{
    menu::{Menu, MenuEvent, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle,
};

use crate::{
    events::{emit_playback, PlaybackCommand},
    window::show_main_window,
};

const SHOW: &str = "show";
const TOGGLE: &str = "toggle";
const NEXT: &str = "next";
const PREVIOUS: &str = "previous";
const QUIT: &str = "quit";

/// Builds the tray icon and its menu.
pub fn create_tray(app: &AppHandle) -> tauri::Result<TrayIcon> {
    let menu = Menu::with_items(
        app,
        &[
            &MenuItem::with_id(app, SHOW, "Show Bitrate", true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, TOGGLE, "Play / Pause", true, None::<&str>)?,
            &MenuItem::with_id(app, NEXT, "Next track", true, None::<&str>)?,
            &MenuItem::with_id(app, PREVIOUS, "Previous track", true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, QUIT, "Quit Bitrate", true, None::<&str>)?,
        ],
    )?;

    let mut tray = TrayIconBuilder::with_id("main")
        .tooltip("Bitrate")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(handle_menu_event)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main_window(tray.app_handle());
            }
        });
    if let Some(icon) = app.default_window_icon() {
        tray = tray.icon(icon.clone());
    }
    tray.build(app)
}

fn handle_menu_event(app: &AppHandle, event: MenuEvent) {
    match event.id().as_ref() {
        SHOW => show_main_window(app),
        TOGGLE => emit_playback(app, PlaybackCommand::Toggle),
        NEXT => emit_playback(app, PlaybackCommand::Next),
        PREVIOUS => emit_playback(app, PlaybackCommand::Previous),
        QUIT => app.exit(0),
        _ => {}
    }
}
