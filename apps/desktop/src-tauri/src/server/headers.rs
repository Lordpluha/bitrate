//! Header rewriting between the renderer's loopback origin and the API.

/// Hop-by-hop headers (RFC 9110 §7.6.1) never forwarded in either direction, plus `host`, which
/// the HTTP client sets for the upstream itself.
const HOP_BY_HOP: [&str; 9] = [
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "host",
];

/// Request headers dropped on the way to the API. The browser sets `origin` and `referer` to
/// the loopback address, which means nothing to the API; a server-to-server request has neither.
const DROPPED_REQUEST: [&str; 2] = ["origin", "referer"];

/// Whether a request header is forwarded to the API.
pub fn forwards_request_header(name: &str) -> bool {
    let name = name.to_ascii_lowercase();
    !HOP_BY_HOP.contains(&name.as_str()) && !DROPPED_REQUEST.contains(&name.as_str())
}

/// Whether a response header is passed back to the renderer.
pub fn forwards_response_header(name: &str) -> bool {
    !HOP_BY_HOP.contains(&name.to_ascii_lowercase().as_str())
}

/// Rewrites an API `Set-Cookie` for the loopback origin: the cookie becomes host-only (the
/// API's `Domain` names the API's site, which the loopback host is not) and loses `Secure`
/// (the loopback hop is plain HTTP; the hop to the API keeps its TLS). Everything else —
/// `HttpOnly`, `SameSite`, `Path`, expiry — is kept as the API set it.
pub fn rewrite_set_cookie(value: &str) -> String {
    value
        .split(';')
        .map(str::trim)
        .filter(|part| {
            let name = part.split('=').next().unwrap_or_default().trim();
            !name.eq_ignore_ascii_case("domain") && !name.eq_ignore_ascii_case("secure")
        })
        .collect::<Vec<_>>()
        .join("; ")
}

/// Rewrites a redirect `Location` that points back at the API into a loopback-relative one,
/// so the follow-up request goes through the proxy too. Other locations are left alone.
pub fn rewrite_location(value: &str, api_base: &str) -> String {
    match value.strip_prefix(api_base) {
        Some("") => "/".to_owned(),
        Some(rest) if rest.starts_with('/') || rest.starts_with('?') => rest.to_owned(),
        _ => value.to_owned(),
    }
}

#[cfg(test)]
#[path = "headers_tests.rs"]
mod tests;
