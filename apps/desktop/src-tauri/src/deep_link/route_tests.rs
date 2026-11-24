use super::deep_link_path;
use url::Url;

fn path_for(link: &str) -> Option<String> {
    deep_link_path(&Url::parse(link).expect("test links are valid URLs"))
}

#[test]
fn opens_the_player_for_a_bare_link() {
    assert_eq!(path_for("bitrate://").as_deref(), Some("/main"));
}

#[test]
fn opens_an_entity_by_its_segment() {
    assert_eq!(
        path_for("bitrate://album/42").as_deref(),
        Some("/main/album/42")
    );
    assert_eq!(
        path_for("bitrate://playlist/abc-1").as_deref(),
        Some("/main/playlist/abc-1")
    );
}

#[test]
fn re_encodes_a_username_like_encode_uri_component() {
    assert_eq!(
        path_for("bitrate://artist/Daft%20Punk").as_deref(),
        Some("/main/artist/Daft%20Punk"),
    );
    assert_eq!(
        path_for("bitrate://user/a%3Fb").as_deref(),
        Some("/main/user/a%3Fb")
    );
}

#[test]
fn opens_an_allowlisted_screen() {
    assert_eq!(
        path_for("bitrate://library").as_deref(),
        Some("/main/library")
    );
    assert_eq!(
        path_for("bitrate://liked-songs/").as_deref(),
        Some("/main/liked-songs")
    );
}

#[test]
fn keeps_only_the_search_query() {
    assert_eq!(
        path_for("bitrate://search?q=lo%20fi&next=https://evil").as_deref(),
        Some("/main/search?q=lo%20fi"),
    );
    assert_eq!(
        path_for("bitrate://search").as_deref(),
        Some("/main/search")
    );
}

#[test]
fn rejects_links_outside_the_allowlist() {
    assert_eq!(path_for("bitrate://settings"), None);
    assert_eq!(path_for("bitrate://album"), None);
    assert_eq!(path_for("bitrate://album/1/2"), None);
    assert_eq!(path_for("bitrate://album/%2E%2E"), None);
    assert_eq!(path_for("https://album/42"), None);
}

#[test]
fn keeps_an_encoded_slash_inside_its_segment() {
    assert_eq!(
        path_for("bitrate://user/a%2Fb").as_deref(),
        Some("/main/user/a%2Fb")
    );
}
