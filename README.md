						#LinkVault#

###Setup Instructions

1. **Server**: Go to `server/`, run `npm install`, then `node index.js`.
2. **Client**: Go to `client/`, run `npm install`, then `npm run dev`.
3. **Requirement Check**: Ensure `react-router-dom` is installed in the client folder.

### Design Decisions and data flow###
- **Frontend**: React + Vite + Tailwind.
- **Backend**: Express.js with SQLite for db.
- **Access Control**: Content is only reachable via 10-character `nanoid` keys; no public listings exist.
- **Expiry**: Default expiry is set to 10 minutes

###API  Overview###
1. User uploads text/file via React.
2. Express generates a unique ID and saves metadata to `vault.db`.
3. Link is returned to the user.
4. On retrieval, server checks current time against `expires_at`.
5. If expired, server returns a 403 response.