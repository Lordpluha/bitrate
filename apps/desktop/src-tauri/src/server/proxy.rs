//! Forwards `/api/*` and `/api-media/*` from the loopback origin to the API.
//!
//! The API authenticates with HttpOnly `SameSite=Lax` cookies only. Called straight from the
//! window they would be third-party cookies; through this proxy they are first-party cookies
//! of the loopback origin, and every reused web-player request, audio range and cover image
//! works unchanged.

use std::sync::Arc;

use axum::{
    body::Body,
    extract::{Request, State},
    http::{header, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
};
use futures_util::TryStreamExt;

use super::headers::{
    forwards_request_header, forwards_response_header, rewrite_location, rewrite_set_cookie,
};

/// web-player's Next rewrite prefix for static media, mapped onto the API root.
const MEDIA_PREFIX: &str = "/api-media";

/// The HTTP client and the API it talks to.
pub struct ProxyTarget {
    pub client: reqwest::Client,
    pub api_base: &'static str,
}

/// Builds the client: no redirect following (the renderer sees the API's redirects, rewritten),
/// no decompression (bodies pass through byte-for-byte with their `Content-Encoding`).
pub fn build_client() -> reqwest::Result<reqwest::Client> {
    reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .build()
}

/// The upstream path for a loopback path and query.
pub fn upstream_path(path_and_query: &str) -> &str {
    match path_and_query.strip_prefix(MEDIA_PREFIX) {
        Some(rest) if rest.starts_with('/') => rest,
        _ => path_and_query,
    }
}

/// Axum handler: one request in, the API's response out, both bodies streamed.
pub async fn forward(State(target): State<Arc<ProxyTarget>>, request: Request) -> Response {
    match send(&target, request).await {
        Ok(response) => response,
        Err(error) => {
            eprintln!("bitrate: API proxy error: {error}");
            (
                StatusCode::BAD_GATEWAY,
                "The Bitrate API could not be reached.",
            )
                .into_response()
        }
    }
}

async fn send(target: &ProxyTarget, request: Request) -> reqwest::Result<Response> {
    let (parts, body) = request.into_parts();
    let path = parts
        .uri
        .path_and_query()
        .map_or("/", |value| value.as_str());
    let url = format!("{}{}", target.api_base, upstream_path(path));

    let mut upstream = target.client.request(parts.method, url);
    for (name, value) in &parts.headers {
        if forwards_request_header(name.as_str()) {
            upstream = upstream.header(name, value);
        }
    }
    let body = reqwest::Body::wrap_stream(body.into_data_stream());
    let reply = upstream.body(body).send().await?;

    let mut response = Response::builder().status(reply.status());
    for (name, value) in reply.headers() {
        if !forwards_response_header(name.as_str()) {
            continue;
        }
        response = response.header(name, rewrite_header(name, value, target.api_base));
    }
    let stream = reply.bytes_stream().map_err(std::io::Error::other);
    Ok(response
        .body(Body::from_stream(stream))
        .unwrap_or_else(|_| StatusCode::BAD_GATEWAY.into_response()))
}

fn rewrite_header(name: &header::HeaderName, value: &HeaderValue, api_base: &str) -> HeaderValue {
    let Ok(text) = value.to_str() else {
        return value.clone();
    };
    let rewritten = if name == header::SET_COOKIE {
        rewrite_set_cookie(text)
    } else if name == header::LOCATION {
        rewrite_location(text, api_base)
    } else {
        return value.clone();
    };
    HeaderValue::from_str(&rewritten).unwrap_or_else(|_| value.clone())
}

#[cfg(test)]
mod tests {
    use super::upstream_path;

    #[test]
    fn maps_media_paths_onto_the_api_root() {
        assert_eq!(
            upstream_path("/api-media/albums/covers/a.webp"),
            "/albums/covers/a.webp"
        );
        assert_eq!(upstream_path("/api/v1/auth/me"), "/api/v1/auth/me");
        assert_eq!(upstream_path("/api-mediax/a"), "/api-mediax/a");
    }
}
