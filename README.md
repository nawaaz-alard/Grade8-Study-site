# Grade 8 Study Hub - SaaS Platform

A comprehensive study portal for Grade 8 students, featuring subject resources, productivity tools, and SaaS capabilities for premium content.

## 🚀 Features

*   **Subject Dashboard**: Access resources for Mathematics, English, Science, and more across 4 terms.
*   **Productivity Tools**: Integrated Pomodoro Timer and cloud-synced To-Do List.
*   **User Accounts**: Secure Sign Up/Login (JWT Auth) to save progress.
*   **SaaS Architecture**:
    *   **Backend API**: Node.js/Express with MongoDB.
    *   **Frontend**: Responsive HTML/CSS/JS (PWA-ready).
    *   **Premium Access**: Stripe integration for subscription-based content.

## 🛠️ Technology Stack

*   **Frontend**: HTML5, CSS3, Vanilla JavaScript, FontAwesome.
*   **Backend**: Node.js, Express.js, TypeScript.
*   **Database**: MongoDB (Mongoose ODM).
*   **Authentication**: JSON Web Tokens (JWT) & bcrypt.
*   **DevOps**: Local Development Environment.

## 📦 Project Structure

```
├── backend/            # API Server (Node.js/Express)
│   ├── src/            # Source Code
│   ├── tests/          # Unit & Integration Tests
│   └── swagger.yaml    # API Documentation
├── css/                # Frontend Styles
├── js/                 # Frontend Logic
├── index.html          # Main Entry Point
└── config.js           # Site Configuration
```

## 🏃‍♂️ Running Locally

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env file with: PORT, MONGODB_URI, JWT_SECRET, STRIPE_SECRET_KEY
npm run dev
```

### 2. Frontend Setup
*   Open `index.html` with Live Server (VS Code Extension).
*   Or run a simple http server in the root directory.

## 📚 API Documentation

When the backend is running, visit:
`http://localhost:8080/api/docs`
