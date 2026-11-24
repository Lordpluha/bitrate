//! The loopback server a release build loads the renderer from.
//!
//! One origin (`http://127.0.0.1:<port>`) serves both the embedded renderer and, under `/api`
//! and `/api-media`, a proxy to the API — the same layout web-player has behind Next. In
//! `tauri dev` the Vite dev server plays this role (`vite/apiProxy.ts`).

mod assets;
mod headers;
mod host_guard;
mod proxy;

use std::{net::Ipv4Addr, sync::Arc};

use axum::{middleware, routing::any, Router};
use tauri::AppHandle;
use tokio::net::TcpListener;

use crate::config::{api_base_url, LOOPBACK_PORTS};
use host_guard::{require_loopback_host, LoopbackPort};
use proxy::{build_client, forward, ProxyTarget};

/// Binds the first free loopback port, starts serving on the async runtime and returns the
/// port. Fails when every candidate port is taken or the HTTP client cannot be built.
pub fn start(app: &AppHandle) -> Result<u16, String> {
    let listener = tauri::async_runtime::block_on(bind_first_free())?;
    let port = listener
        .local_addr()
        .map_err(|error| error.to_string())?
        .port();

    let target = Arc::new(ProxyTarget {
        client: build_client().map_err(|error| error.to_string())?,
        api_base: api_base_url(),
    });
    let api = Router::new()
        .route("/api/{*path}", any(forward))
        .route("/api-media/{*path}", any(forward))
        .with_state(target);
    let router = Router::new()
        .merge(api)
        .fallback(assets::serve)
        .with_state(app.clone())
        .layer(middleware::from_fn_with_state(
            LoopbackPort(port),
            require_loopback_host,
        ));

    tauri::async_runtime::spawn(async move {
        if let Err(error) = axum::serve(listener, router).await {
            eprintln!("bitrate: loopback server stopped: {error}");
        }
    });
    Ok(port)
}

async fn bind_first_free() -> Result<TcpListener, String> {
    for port in LOOPBACK_PORTS {
        if let Ok(listener) = TcpListener::bind((Ipv4Addr::LOCALHOST, port)).await {
            return Ok(listener);
        }
    }
    Err(format!("no free loopback port in {LOOPBACK_PORTS:?}"))
}
