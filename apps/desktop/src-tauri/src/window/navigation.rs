//! Which URLs the main window may navigate to itself.

use url::Url;

/// Whether a top-level navigation stays inside the renderer: same scheme, host and port as the
/// origin the window was opened on. Anything else is an external page for the system browser.
pub fn is_in_app(target: &Url, origin: &Url) -> bool {
    target.scheme() == origin.scheme()
        && target.host_str() == origin.host_str()
        && target.port_or_known_default() == origin.port_or_known_default()
}

/// Whether an external URL may be handed to the system browser. Only web and mail links are;
/// a `file:`, `javascript:` or custom-scheme URL from page content is dropped.
pub fn is_openable_externally(target: &Url) -> bool {
    matches!(target.scheme(), "https" | "http" | "mailto")
}

#[cfg(test)]
mod tests {
    use super::{is_in_app, is_openable_externally};
    use url::Url;

    fn url(value: &str) -> Url {
        Url::parse(value).expect("test URLs are valid")
    }

    #[test]
    fn keeps_same_origin_navigation_in_the_window() {
        let origin = url("http://127.0.0.1:47810/main");
        assert!(is_in_app(
            &url("http://127.0.0.1:47810/auth/login"),
            &origin
        ));
        assert!(!is_in_app(&url("http://127.0.0.1:47811/main"), &origin));
        assert!(!is_in_app(&url("http://localhost:47810/main"), &origin));
        assert!(!is_in_app(&url("https://bitrate.app/main"), &origin));
    }

    #[test]
    fn opens_only_web_and_mail_links_externally() {
        assert!(is_openable_externally(&url("https://example.com")));
        assert!(is_openable_externally(&url("mailto:help@example.com")));
        assert!(!is_openable_externally(&url("file:///etc/passwd")));
        assert!(!is_openable_externally(&url("smb://host/share")));
    }
}
