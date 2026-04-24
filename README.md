# SRM BFHL Full Stack Challenge

This is a complete full-stack solution for the SRM BFHL Challenge. It features an Express.js backend for processing and analyzing directed graph edge inputs, and a React (Vite) frontend with a modern dark glassmorphism theme for visualizing the generated hierarchies and cycles.

## Project Structure

- `/backend` - Node.js + Express backend.
- `/frontend` - React + Vite + TypeScript frontend.

## Features

- **Express API**: Processes an array of edge strings (`A->B`).
  - Validates and deduplicates input edges.
  - Generates directed acyclic graphs (trees) or detects cycles using DFS.
  - Identifies single-parent inheritance structures and discards invalid multi-parent relations.
  - Returns structured hierarchical data and a summary of total trees, cycles, and maximum depths.
- **React UI**: A beautiful, responsive, modern interface.
  - Submits the comma-separated edges via POST request to the backend.
  - Beautiful glassmorphism aesthetic with CSS modules.
  - Highlights cycles, missing/invalid entries, duplicates, and successfully built hierarchies.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Start the Backend

Open a terminal and run the following:

```bash
cd backend
npm install
npm start
```

The backend server will run on `http://localhost:3000`.

### 2. Start the Frontend

Open another terminal and run the following:

```bash
cd frontend
npm install
npm run dev
```

The React app will open in your default browser, usually on `http://localhost:5173`.

## Deployment to Vercel / Render

### Backend (Render)
1. Push the repository to GitHub.
2. Go to Render.com and create a new **Web Service**.
3. Point to your repository and set the Root Directory to `backend`.
4. Set Build Command to `npm install`.
5. Set Start Command to `npm start`.
6. Click Deploy. Ensure the host is set correctly for your frontend (update CORS origin in `backend/index.js` if necessary).

### Frontend (Vercel)
1. Go to Vercel.com and add a new **Project**.
2. Point to the repository and select the `frontend` directory as the Root Directory.
3. Framework Preset should automatically be Vite.
4. Ensure the backend URL in `App.tsx` (`http://localhost:3000/bfhl`) is updated to the actual Render backend URL via environment variables for production.
5. Click Deploy.

## Example Test Input

You can copy and paste the following test input into the frontend textarea:

```text
A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H, G->H, G->I, hello, 1->2, A->
```

**Expected Results:**
- **Trees**: 3
- **Cycles**: 1 (X, Y, Z)
- **Largest Tree Root**: A (Depth 4)
- **Invalid Entries**: `hello`, `1->2`, `A->`
- **Duplicate Edges**: `G->H`
