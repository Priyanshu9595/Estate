# EstateFlow

Property management for landlords and tenants: owners publish properties and rooms,
tenants browse them, complete KYC, sign a lease and pay rent online, and admins work
through maintenance requests.

This repository holds the React client. It talks to the EstateFlow API over HTTP —
point it at one with `VITE_API_URL`. Without that variable the app calls
`http://localhost:5000` on localhost and its own origin elsewhere, see
[src/config.js](src/config.js).

## Requirements

- Node.js 20 or newer
- npm

## Getting started

```bash
npm install
npm run dev      # Vite dev server
npm test         # Vitest suite
npm run lint     # oxlint
npm run build    # production bundle
```

## Layout

| Path | Contents |
| --- | --- |
| `src/pages` | Route-level screens (dashboards, property details, auth) |
| `src/components` | Navbar, sidebar and the AI chatbot widget |
| `src/context` | Auth provider and the axios auth interceptor |
| `src/utils` | Lease PDF generation |
