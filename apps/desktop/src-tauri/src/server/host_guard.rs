//! Rejects requests whose `Host` is not the loopback origin itself.
//!
//! Without this, a web page could point a hostname of its own at 127.0.0.1 (DNS rebinding)
//! and read the renderer's responses — including proxied API responses — as same-origin.

use axum::{
    extract::{Request, State},
    http::{header::HOST, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
};

/// The loopback port the server is bound to; the only `Host` values accepted carry it.
#[derive(Clone, Copy)]
pub struct LoopbackPort(pub u16);

/// Whether a `Host` header names this server.
pub fn is_loopback_host(host: &str, port: u16) -> bool {
    host == format!("127.0.0.1:{port}") || host == format!("localhost:{port}")
}

/// Axum middleware applying [`is_loopback_host`].
pub async fn require_loopback_host(
    State(LoopbackPort(port)): State<LoopbackPort>,
    request: Request,
    next: Next,
) -> Response {
    let allowed = request
        .headers()
        .get(HOST)
        .and_then(|value| value.to_str().ok())
        .is_some_and(|host| is_loopback_host(host, port));

    if allowed {
        next.run(request).await
    } else {
        StatusCode::MISDIRECTED_REQUEST.into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::is_loopback_host;

    #[test]
    fn accepts_only_the_bound_loopback_origin() {
        assert!(is_loopback_host("127.0.0.1:47810", 47810));
        assert!(is_loopback_host("localhost:47810", 47810));
        assert!(!is_loopback_host("127.0.0.1:47811", 47810));
        assert!(!is_loopback_host("evil.example:47810", 47810));
        assert!(!is_loopback_host("127.0.0.1", 47810));
    }
}
