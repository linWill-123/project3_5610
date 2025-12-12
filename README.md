# Sudoku Full Stack Application - Setup Guide

## Overview
This is a full-stack Sudoku application with:
- **Frontend**: React 
- **Backend**: Express.js + RESTFUL API
- **Database**: MongoDB Atlas 

## Prerequisites
- Node.js installed
- MongoDB Atlas account with connection string

### 1. Install Dependencies

#### Frontend (Frontend directory):
```bash
cd frontend
npm install
```

#### Backend (Server directory):
```bash
cd backend
npm install
```

### 2. Running 

You need to run both the backend server and the frontend React app:

In one terminal, navigate to **backend** folder and 
```bash
npm start
```

Or run 
```bash
npm run dev
```

The server will run on `http://localhost:5000`

In another terminal navigate to **frontend** and run:
```bash
npm start
```

### 3. Debugging
To check if server's running, you can run:
```bash
curl -s http://localhost:5000/api/health
```