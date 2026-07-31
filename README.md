# SecureQR

Privacy-first QR code generator built with React and Vite.

## Privacy model

- QR data is processed entirely in the browser.
- No accounts, database, analytics, cookies, or persistent storage.
- URL mode accepts only HTTP and HTTPS schemes.
- User content is never rendered as HTML.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Upload the contents of `dist/` to Hostinger `public_html`, or connect the GitHub repository to a supported Hostinger deployment workflow.

## Recommended hosting headers

Configure these at the hosting layer where supported:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```
