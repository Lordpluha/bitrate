//! Maps a `bitrate://` deep link to the renderer route it opens.
//!
//! Only an allowlist is accepted: a link comes from outside the app (a browser, a chat, another
//! program), so it may name a screen or an entity, never an arbitrary path.

use percent_encoding::{percent_decode_str, utf8_percent_encode, AsciiSet, NON_ALPHANUMERIC};
use url::Url;

const SCHEME: &str = "bitrate";

/// Screens a link may open without an argument, by their segment after `/main/`.
const SCREENS: [&str; 8] = [
    "library",
    "liked-songs",
    "queue",
    "charts",
    "recents",
    "notifications",
    "friends",
    "stats",
];

/// Entities a link may open by one id or username segment.
const ENTITIES: [&str; 4] = ["album", "artist", "playlist", "user"];

/// What JavaScript's `encodeURIComponent` leaves unescaped: the renderer's `ROUTES` builds
/// entity URLs with it, so a re-encoded segment matches the URL the app itself would make.
const URI_COMPONENT: &AsciiSet = &NON_ALPHANUMERIC
    .remove(b'-')
    .remove(b'_')
    .remove(b'.')
    .remove(b'!')
    .remove(b'~')
    .remove(b'*')
    .remove(b'\'')
    .remove(b'(')
    .remove(b')');

/// Longest id or username segment a link may carry.
const MAX_SEGMENT_LENGTH: usize = 128;

/// The in-app path for a deep link, or `None` when the link is not one the app opens.
///
/// `bitrate://album/42` → `/main/album/42`, `bitrate://search?q=lofi` → `/main/search?q=lofi`,
/// `bitrate://` → `/main`.
pub fn deep_link_path(link: &Url) -> Option<String> {
    if link.scheme() != SCHEME {
        return None;
    }

    let section = link.host_str().unwrap_or_default();
    let segments: Vec<&str> = link
        .path_segments()
        .map(|parts| parts.filter(|part| !part.is_empty()).collect())
        .unwrap_or_default();

    match (section, segments.as_slice()) {
        ("", []) => Some("/main".to_owned()),
        ("search", []) => Some(search_path(link)),
        (screen, []) if SCREENS.contains(&screen) => Some(format!("/main/{screen}")),
        (entity, [segment]) if ENTITIES.contains(&entity) => {
            entity_segment(segment).map(|segment| format!("/main/{entity}/{segment}"))
        }
        _ => None,
    }
}

/// `/main/search`, carrying only the `q` parameter, re-encoded.
fn search_path(link: &Url) -> String {
    let query = link
        .query_pairs()
        .find(|(key, _)| key == "q")
        .map(|(_, value)| value.into_owned());

    match query {
        Some(query) if !query.is_empty() => {
            format!(
                "/main/search?q={}",
                utf8_percent_encode(&query, URI_COMPONENT)
            )
        }
        _ => "/main/search".to_owned(),
    }
}

/// A path segment re-encoded from its decoded form, so `..`, `/` and `?` cannot escape it.
fn entity_segment(raw: &str) -> Option<String> {
    let decoded = percent_decode_str(raw).decode_utf8().ok()?;
    if decoded.is_empty()
        || decoded.chars().count() > MAX_SEGMENT_LENGTH
        || decoded == "."
        || decoded == ".."
    {
        return None;
    }
    Some(utf8_percent_encode(&decoded, URI_COMPONENT).to_string())
}

#[cfg(test)]
#[path = "route_tests.rs"]
mod tests;
