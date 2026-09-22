# EstateFlow

Property management for landlords and tenants: owners publish properties and rooms,
tenants browse them, complete KYC, sign a lease and pay rent online, and admins work
through maintenance requests. The React app lives at the repository root; the Express
API that backs it lives in `backend/`.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB (for the API)

## Frontend

```bash
npm install
npm run dev      # Vite dev server
npm test         # Vitest suite
npm run lint     # oxlint
npm run build    # production bundle
```

Point the app at an API with `VITE_API_URL`. Without it the app talks to
`http://localhost:5000` on localhost and to its own origin elsewhere — see
[src/config.js](src/config.js).

## Backend

```bash
cd backend
npm install
npm run dev      # nodemon on src/index.js
```

The API reads `MONGODB_URI`, `JWT_SECRET`, mail credentials, Razorpay keys and
`GROQ_API_KEY` from a `.env` file in `backend/`. Uploaded files are stored in MongoDB
(GridFS), not on disk.

## Layout

| Path | Contents |
| --- | --- |
| `src/pages` | Route-level screens (dashboards, property details, auth) |
| `src/components` | Navbar, sidebar and the AI chatbot widget |
| `src/context` | Auth provider and the axios auth interceptor |
| `src/utils` | Lease PDF generation |
| `backend/src` | Express routes, controllers and Mongoose models |
