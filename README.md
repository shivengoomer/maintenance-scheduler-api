# 🛠 Maintenance Scheduler API

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue)

![Express](https://img.shields.io/badge/Express-4.x-lightgrey)

## 📌 Table of Contents
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [API Endpoints](#-api-endpoints)


## ✨ Features
- Automated maintenance scheduling
- Email notification system
- Equipment management
- Maintenance history tracking
- RESTful API interface

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/maintenance-scheduler.git
cd maintenance-scheduler

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env file with your credentials

# Start development server
npm run dev

# Start production server
npm start

🔧 Environment Setup
Create .env file with these variables:

ini
# Database
NEON_CONNECTION_STRING=postgres://user:password@ep-example.neon.tech/maintenance

# Email
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=3000
NODE_ENV=development
```

# 📡 API Endpoints
 ## Equipment
POST  `/equipment`  # Add new equipment  
GET   `/equipment`  # List all equipment  

## Schedules
POST  `/schedules`  # Create maintenance schedule  
GET   `/schedules`  # List all schedules  

## Logs
POST  `/logs`       # Record maintenance activity


---

