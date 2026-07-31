# Hostinger deployment

1. Run `npm ci && npm run build`.
2. Upload the **contents** of `dist/` to the target website's `public_html` directory.
3. Keep the included `.htaccess`; it disables directory listing, adds defensive HTTP headers, caching, and the single-page fallback.
4. Enable Hostinger SSL and force HTTPS.
5. Verify the deployed response includes the Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and X-Frame-Options headers.

Alternatively, download `secureqr-hostinger.zip` from the project handoff, extract it, then upload the contents of its `dist` directory.
