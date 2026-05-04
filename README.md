# Team Task Manager

A full-stack MERN project management app with role-based access control.

## Live Demo
- Frontend: https://your-frontend.up.railway.app
- Backend: https://your-backend.up.railway.app

## Features
- JWT Authentication (Signup/Login)
- Create & manage projects
- Admin/Member role-based access
- Task management (Create, Assign, Status updates)
- Dashboard with stats and progress tracking
- Fully deployed on Railway

## Tech Stack
- **Frontend:** React + Vite, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Auth:** JWT + bcryptjs
- **Deployment:** Railway

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Backend Setup
```bash
cd Backend
npm install
```
Create `.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NODE_ENV=development
```
```bash
npm run dev
```

### Frontend Setup
```bash
cd Frontend
npm install
```
Create `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```
```bash
npm run dev
```

## Deployment (Railway)
1. Push code to GitHub
2. Create Railway project
3. Deploy Backend service with env variables
4. Deploy Frontend service
5. Connect frontend VITE_API_URL to backend Railway URL