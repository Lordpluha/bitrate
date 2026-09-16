---
'@bitrate/admin': patch
---

Fixed sign-in reporting failure for correct operator credentials. `POST /admin/auth/login`
answers 201 with no body — it only sets the two httpOnly cookies, exactly as its Swagger
documents — but the panel parsed that empty response against the staff schema, so Zod threw and
the login screen showed "Sign-in failed. Check the address and password, then try again." while
the session cookies had in fact been set; reloading the page let you straight in. The signed-in
operator is now read back from `/admin/auth/me` on the session the cookies just established, and
the repository has specs covering the empty body, refused credentials, and a session that cannot
be read back.
