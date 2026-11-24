use super::{
    forwards_request_header, forwards_response_header, rewrite_location, rewrite_set_cookie,
};

#[test]
fn makes_api_cookies_host_only_and_plain_http() {
    assert_eq!(
        rewrite_set_cookie(
            "access_token=abc; Path=/; Domain=.bitrate.app; HttpOnly; Secure; SameSite=Lax"
        ),
        "access_token=abc; Path=/; HttpOnly; SameSite=Lax",
    );
}

#[test]
fn keeps_a_cookie_value_that_mentions_domain() {
    assert_eq!(
        rewrite_set_cookie("note=domain=x; Path=/"),
        "note=domain=x; Path=/"
    );
}

#[test]
fn keeps_expiry_with_its_comma() {
    assert_eq!(
        rewrite_set_cookie("a=1; Expires=Wed, 21 Oct 2026 07:28:00 GMT; secure"),
        "a=1; Expires=Wed, 21 Oct 2026 07:28:00 GMT",
    );
}

#[test]
fn rewrites_only_redirects_back_to_the_api() {
    let api = "https://api.bitrate.app";
    assert_eq!(
        rewrite_location("https://api.bitrate.app/api/v1/x?y=1", api),
        "/api/v1/x?y=1"
    );
    assert_eq!(rewrite_location("https://api.bitrate.app", api), "/");
    assert_eq!(
        rewrite_location("https://api.bitrate.app.evil/x", api),
        "https://api.bitrate.app.evil/x"
    );
    assert_eq!(
        rewrite_location("https://accounts.google.com/o", api),
        "https://accounts.google.com/o"
    );
}

#[test]
fn filters_hop_by_hop_and_origin_headers() {
    assert!(forwards_request_header("Cookie"));
    assert!(forwards_request_header("range"));
    assert!(!forwards_request_header("Origin"));
    assert!(!forwards_request_header("Host"));
    assert!(!forwards_request_header("Connection"));
    assert!(forwards_response_header("set-cookie"));
    assert!(!forwards_response_header("Transfer-Encoding"));
}
