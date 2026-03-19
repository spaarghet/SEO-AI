# SEO AI SaaS - Content Generation Platform

A full-stack MERN application that leverages multiple AI providers (Google Gemini & Groq Llama 3) to generate SEO-optimized blog metadata, outlines, and internal link suggestions.

## Live Demo
**[Insert Your Vercel URL Here]** *Admin Credentials:* `admin@gmail.com` / `admin@123`

---

## Setup Instructions

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

## Environment Variables

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

##  Architecture Explanation

The application follows a standard **MERN (MongoDB, Express, React, Node)** architecture, prioritized for scalability and maintainability. The **Backend** is built as a RESTful API using Express, featuring custom middleware for JWT authentication, role-based access control (RBAC), and global error handling. It utilizes a service-oriented pattern for AI integrations, separating prompt engineering logic into dedicated service files (Gemini and Groq).

On the **Frontend**, React 18 is used with a centralized `AuthContext` to manage user sessions across the app. Routing is protected via a custom `PrivateRoute` component that verifies tokens before granting access to pages like the Generator or Admin Dashboard. The UI is built with **Tailwind CSS**, ensuring full responsiveness and a consistent design language using a mobile-first approach.

---

##  AI Integrations & Prompt Engineering

* **Google Gemini:** Used for standard generation via the `@google/generative-ai` SDK. The prompt is engineered to strictly enforce a JSON structure, ensuring metadata and outlines are returned in a format the frontend can parse reliably.
* **Groq (Llama 3):** Leveraged for ultra-fast **Live Streaming** via Server-Sent Events (SSE). The system prompts are optimized for the Llama 3.1 architecture to reduce hallucinations while maintaining high-speed output for long blog outlines.

## Project Overview

The SEO AI SaaS is a full-stack content generation platform built using the MERN (MongoDB, Express, React, Node.js) architecture to help users generate SEO-optimized blog metadata, outlines, and internal link suggestions. It utilizes a multi-provider AI strategy, integrating Google Gemini for structured data generation and Groq’s Llama 3 model for high-speed content delivery. The system is designed to provide ultra-fast results through live streaming capabilities via Server-Sent Events (SSE), ensuring a modern and efficient user experience.

The backend is developed as a RESTful API that emphasizes security and performance through custom middleware, including JWT authentication, role-based access control, and global error handling. It incorporates rate limiting to protect resources and uses Mongoose for managing database operations related to user accounts and content history. The server-side logic follows a service-oriented pattern, which separates the complex prompt engineering for Gemini and Groq into dedicated modules to maintain code scalability.

On the frontend, the application uses React 18 and Tailwind CSS to provide a responsive, mobile-first interface. It features a centralized authentication context and private routing to secure access to the dashboard, AI generator, and generation history pages. Users can switch between AI providers, track their past generation activities, and export their results as text files for external use.

## Architecture Explanation
This application follows a modern three-tier MERN stack architecture, designed for separation of concerns and scalability. It is built entirely using JavaScript/TypeScript-based technologies, ensuring a unified development experience across the stack.

1. Frontend Layer (React.js & Tailwind CSS)
The client-side is a Single Page Application (SPA) built with React 18. It uses a component-based architecture to manage the user interface. State management is handled primarily through the Context API (AuthContext), which maintains user sessions and authentication states globally. The UI is styled using Tailwind CSS, utilizing a mobile-first responsive design approach to ensure accessibility across desktops, tablets, and smartphones.

2. Backend Layer (Node.js & Express.js)
   The server acts as a RESTful API gateway. It handles critical business logic including:

   Authentication & Security: Implementing JWT (JSON Web Tokens) for secure, stateless authentication and Role-Based Access Control (RBAC) to distinguish between Admin, Pro, and Free users.

   AI Orchestration: The server manages communication with multiple AI providers. It uses a Service-Oriented Pattern, where provider-specific logic (for Google Gemini and Groq) is isolated into separate service modules.

   Real-time Streaming: Leveraging Server-Sent Events (SSE) to provide a live "typing" effect for AI generations, enhancing the user experience.

3. Data Layer (MongoDB & Mongoose)
   A NoSQL database (MongoDB Atlas) is used for flexible, document-based storage. This is ideal for SEO content, as generation outputs can vary in structure. Mongoose is employed as an ODM (Object Data Modeling) library to    enforce schemas, handle data validation, and manage relationships between users and their generation history.

## Known Limitations
   Export Restrictions: Currently, the platform only supports exports in .txt format. There is no native support for PDF, Word, or HTML.
   Single-Prompt Context: The AI generation is stateless. It does not "remember" previous generations within a project, meaning every request is processed independently without shared context.
   Static Quota Management: The current quota system is hardcoded per role. There is no automated billing or "top-up" system for users who run out of credits.
   Basic Prompting: The prompts are currently generalized. There is limited customization for specific industry niches or tone-of-voice settings.

## Future Improvements
   Integrated Content Editor: Implementing a Rich Text Editor (like TipTap) so users can expand outlines into full articles directly inside the app.
   Direct CMS Publishing: One-click integration to push generated content directly to WordPress, Shopify, or Ghost via their respective APIs.
   SEO Scoring Engine: Integrating a real-time SEO analyzer that provides a "score" based on keyword density, readability, and heading structure.
   Stripe Integration: Adding a subscription-based payment gateway to automate user upgrades and credit purchases.
   Advanced Analytics: A dashboard for users to track how their generated content is performing in terms of search rankings and traffic.
