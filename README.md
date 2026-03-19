# SEO AI SaaS - Content Generation Platform

A full-stack MERN application that leverages multiple AI providers (Google Gemini & Groq Llama 3) to generate SEO-optimized blog metadata, outlines, and internal link suggestions.

## 🚀 Live Demo
**[Insert Your Vercel URL Here]** *Admin Credentials:* `admin@gmail.com` / `admin@123`

---

## 🛠️ Setup Instructions

### 1. Local Environment
**Backend:**
1. Navigate to the `/server` folder.
2. Create a `.env` file (see Environment Variables list).
3. Install dependencies: `npm install`.
4. Seed the admin user: `npm run seed:admin`.
5. Start development server: `npm run dev`.

**Frontend:**
1. Navigate to the `/client` folder.
2. Create a `.env` file (pointing to your local backend URL).
3. Install dependencies: `npm install`.
4. Start development server: `npm run dev`.

### 2. Production Deployment
* **Database:** Create a free cluster on **MongoDB Atlas**. Whitelist `0.0.0.0/0` for access.
* **Backend:** Deploy to **Render** or **Railway**. Set all environment variables in the platform's Secret Manager.
* **Frontend:** Deploy to **Vercel** or **Netlify**. Ensure `VITE_API_BASE` points to your deployed backend API URL.

---

## 🔑 Environment Variables

### Backend (`/server/.env`)
* `PORT`: Server port (e.g., 5000)
* `MONGO_URI`: MongoDB connection string
* `JWT_SECRET`: Secure string for token signing
* `JWT_EXPIRES_IN`: expire duration of token
* `RATE_LIMIT_WINDOW_MS`: rate limit window in milliseconds
* `RATE_LIMIT_MAX`: rate limit maximum requests per window
* `GEMINI_MODEL`: Recommended model (e.g., `gemini-3-flash-preview`)

* `GEMINI_API_KEY`: Google AI Studio API Key
* `GROQ_API_KEY`: Groq Console API Key
* `GROQ_MODEL`: Recommended model (e.g., `llama-3.1-8b-instant`)
* `CLIENT_URL`: frontend URL



### Frontend (`/client/.env`)
* `VITE_API_BASE`: Full URL to your API (e.g., `https://your-api.onrender.com/api`)

---

## 🏗️ Architecture Explanation

The application follows a standard **MERN (MongoDB, Express, React, Node)** architecture, prioritized for scalability and maintainability. The **Backend** is built as a RESTful API using Express, featuring custom middleware for JWT authentication, role-based access control (RBAC), and global error handling. It utilizes a service-oriented pattern for AI integrations, separating prompt engineering logic into dedicated service files (Gemini and Groq).

On the **Frontend**, React 18 is used with a centralized `AuthContext` to manage user sessions across the app. Routing is protected via a custom `PrivateRoute` component that verifies tokens before granting access to pages like the Generator or Admin Dashboard. The UI is built with **Tailwind CSS**, ensuring full responsiveness and a consistent design language using a mobile-first approach.

---

## 🤖 AI Integrations & Prompt Engineering

* **Google Gemini:** Used for standard generation via the `@google/generative-ai` SDK. The prompt is engineered to strictly enforce a JSON structure, ensuring metadata and outlines are returned in a format the frontend can parse reliably.
* **Groq (Llama 3):** Leveraged for ultra-fast **Live Streaming** via Server-Sent Events (SSE). The system prompts are optimized for the Llama 3.1 architecture to reduce hallucinations while maintaining high-speed output for long blog outlines.
