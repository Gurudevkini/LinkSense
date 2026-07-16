# LinkSense
**A developer-first URL shortener that doesn't get in your way.**

I built this because of a minor annoyance. I wanted to shorten a link for a project demo, went to Bitly, typed in a custom alias, and clicked submit. Nothing happened. No error message, no red outlines, just a dead button that did absolutely nothing. It was incredibly frustrating for something that should be a simple database check and redirect.

So, I built LinkSense. It does one thing right: you type a URL, pick an alias (or leave it blank), get instant feedback on whether it's available, and get your short link. No bloated dashboard, no signup walls, just the core flow working exactly how you expect.

---

## ⚡ The Quick Summary

LinkSense keeps it clean: a dark-mode form, live debounced alias checking, and a redirect flow that gracefully handles database hiccups (like your connection going offline) without crashing.

* **Frontend**: React (Vite) styled with plain CSS on an 8px grid. Nice and snappy.
* **Backend**: Node.js & Express (using modern ES Modules).
* **Storage**: MongoDB Atlas (via Mongoose) with an Upstash Redis cache tier.
* **Fallback**: If MongoDB is unreachable, it automatically swaps to an in-memory store. Perfect for local dev without messing with IP whitelists.

---

## 📁 How the Repo is Organized

We split the code cleanly into two halves:

```text
LinkSense/
├── Client/                         # Frontend Vite React App
│   ├── public/                     # Static files (like our system architecture diagram)
│   ├── src/
│   │   ├── components/
│   │   │   └── Toast.jsx           # Notification toast (for when things go wrong)
│   │   ├── config/
│   │   │   └── constants.js        # Blocked file extensions and constants
│   │   ├── pages/
│   │   │   └── RedirectPage.jsx    # Secure client-side redirect landing page
│   │   ├── utils/
│   │   │   └── validation.js       # URL validation logic
│   │   ├── App.css                 # Main styling (dark theme, responsive layout)
│   │   ├── App.jsx                 # Core form UI & state handling
│   │   └── main.jsx                # React mount point
│   
├── Server/                         # Express API Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # MongoDB connection handler
│   │   │   ├── env.js              # Environment variable checks
│   │   │   └── redis.js            # Redis initialization
│   │   ├── models/
│   │   │   └── Url.js              # URL database model
│   │   ├── services/
│   │   │   └── urlService.js       # Database storage logic + in-memory fallback
│   │   ├── utils/
│   │   │   └── blockedExtensions.js# Rejects dangerous file links (like .exe)
│   │   └── app.js                  # Routing & request resolution
│   └── index.js                    # Entry point for the server
```

---

## 🛠️ Key Details & How It Works

### The Redirection Flow
When someone hits a shortened link:
1. We first check the **Redis cache**. If it's a hit, they get redirected immediately (under 10ms).
2. If it's a miss, we look it up in **MongoDB Atlas**, write the mapping to Redis so the next visit is instant, and perform the redirect.
3. If MongoDB goes down (e.g., Atlas IP whitelist blocks your current connection), the server falls back to an **in-memory store** rather than crashing.

### Live Alias Validation
As you type your custom alias, it debounces for `400ms` before querying the backend. If the alias is already taken, the backend returns 5 suggestions (e.g., prefixing `my-` or adding suffixes) so you aren't left guessing.

### Extension Filtering
We don't want LinkSense to be used to share malware. Both the client and server check the destination URL path and block dangerous extensions like `.exe`, `.dmg`, `.zip`, `.pdf`, etc.

---

## ⚙️ Running It Locally

### 1. Setup Environment
Create a `.env` file in the `/Server` folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
REDIS_URL=your_redis_connection_string
```

### 2. Start Backend
```bash
cd Server
npm install
npm run dev
```
*Note: If you don't provide a MongoDB URI, the server will warn you and fall back to local in-memory storage. Redirection will still work, but links won't persist if the server restarts.*

### 3. Start Frontend
```bash
cd Client
npm install
npm run dev
```
The React frontend will spin up on `http://localhost:5173`.

---

## 📡 API Reference

### Health Check
`GET /api/health`
Checks if the server is healthy and returns uptime.

### Check Alias
`POST /api/check-alias`
Check if your desired slug is free.
* **Payload**: `{ "alias": "portfolio" }`
* **Response**:
    ```json
    {
      "available": false,
      "suggestions": ["my-portfolio", "portfolio-dev", "portfolio2026", "portfolio-1"]
    }
    ```

### Shorten URL
`POST /api/shorten`
Generate a short link.
* **Payload**: `{ "originalUrl": "https://...", "customKeyword": "my-alias" }`
* **Response**: `{ "slug": "my-alias", "shortenedUrl": "http://localhost:5000/my-alias" }`

### Resolve URL
`GET /api/resolve/:slug`
Retrieves the full URL destination.

### Direct Redirect
`GET /:slug`
Directly issues a `302 Found` redirect header to the destination URL.

---

## 💻 Tech Stack Choice

* **Frontend**: React 19, React Router v7, Vite.
* **Backend**: Express 5, Mongoose 9, ioredis.
* **Deployment**: Vercel (Client), Render (Server), Upstash (Redis).