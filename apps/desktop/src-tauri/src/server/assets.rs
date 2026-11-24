//! Serves the bundled renderer (Vite's `dist`, embedded in the binary) on the loopback origin.

use axum::{
    extract::{Request, State},
    http::{header, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
};
use tauri::AppHandle;

const INDEX: &str = "index.html";

/// The renderer's policy when Tauri hands back none: the same string as `tauri.conf.json`
/// `app.security.csp`, so a missing header can never mean "no policy".
const FALLBACK_CSP: &str = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self' ipc: http://ipc.localhost; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";

/// Vite fingerprints everything under `assets/`, so it can be cached for good.
const IMMUTABLE: &str = "public, max-age=31536000, immutable";

/// The embedded file a request path names; a path without an extension is a client route and
/// gets the SPA's `index.html`.
pub fn asset_key(path: &str) -> String {
    let path = path.trim_start_matches('/');
    let file = path.rsplit('/').next().unwrap_or_default();
    if path.is_empty() || !file.contains('.') {
        INDEX.to_owned()
    } else {
        path.to_owned()
    }
}

/// Axum handler for every non-API path.
pub async fn serve(State(app): State<AppHandle>, request: Request) -> Response {
    let key = asset_key(request.uri().path());
    let Some(asset) = app.asset_resolver().get(key.clone()) else {
        return StatusCode::NOT_FOUND.into_response();
    };

    let mut response = Response::new(asset.bytes.into());
    let headers = response.headers_mut();
    if let Ok(mime) = HeaderValue::from_str(&asset.mime_type) {
        headers.insert(header::CONTENT_TYPE, mime);
    }
    headers.insert(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    );

    if key == INDEX {
        let csp = asset.csp_header.as_deref().unwrap_or(FALLBACK_CSP);
        if let Ok(csp) = HeaderValue::from_str(csp) {
            headers.insert(header::CONTENT_SECURITY_POLICY, csp);
        }
        headers.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-cache"));
    } else if key.starts_with("assets/") {
        headers.insert(header::CACHE_CONTROL, HeaderValue::from_static(IMMUTABLE));
    }
    response
}

#[cfg(test)]
mod tests {
    use super::asset_key;

    #[test]
    fn serves_files_and_falls_back_to_the_spa() {
        assert_eq!(asset_key("/"), "index.html");
        assert_eq!(asset_key("/main/album/42"), "index.html");
        assert_eq!(asset_key("/assets/index-abc.js"), "assets/index-abc.js");
        assert_eq!(asset_key("/images/fallback.webp"), "images/fallback.webp");
    }
}
