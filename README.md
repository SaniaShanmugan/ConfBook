# ConfBook – AI Powered Conference Hall Booking System

## Overview

ConfBook is an intelligent conference hall booking system built to simplify meeting room management using conversational AI. Users can book, modify, cancel, and check hall availability through both a modern UI and an AI assistant powered by Groq.

The system also includes real-time booking monitoring, automated notifications, and email alerts.

---

## Features

### Authentication

* User Registration & Login
* JWT Authentication
* Protected Routes

### Booking System

* Calendar-based booking interface
* Dynamic hall availability checking
* Real-time conflict detection
* Purpose-based booking confirmation
* Active meeting tracking

### AI Assistant (Groq Integration)

Users can interact with the AI assistant to:

* Book conference halls
* Modify existing bookings
* Cancel bookings
* Check hall availability
* Continue multi-step conversations naturally

### Smart Booking Logic

* Time overlap detection
* Booking validation
* Hall normalization
* Conversational booking flow handling
* Confirmation-based booking system

### Notifications

* Automated booking-end notifications
* Real-time popup alerts
* Audio notifications
* EmailJS email alerts

---

## Tech Stack

### Frontend

* React.js
* CSS3
* React Router

### Backend

* Node.js
* Express.js

### Database

* MySQL

### AI Integration

* Groq API
* Llama 3.3 70B Versatile Model

### Other Services

* JWT Authentication
* Node Cron
* EmailJS

---

## Project Structure

```bash
frontend/
 ├── components/
 ├── pages/
 ├── api.js
 └── App.jsx

backend/
 ├── routes/
 ├── services/
 ├── cron/
 ├── middleware/
 ├── utils/
 └── index.js
```

---

## AI Assistant Workflow

```text
User Message
      ↓
Intent Detection
      ↓
Booking / Modify / Cancel / Availability Flow
      ↓
Groq Extraction Engine
      ↓
Booking Validation
      ↓
Database Update
```

---

## Environment Variables

### Backend (.env)

```env
PORT=5000

DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=

GROQ_API_KEY=

EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
```

---

## Installation

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Key Functionalities

* AI-powered conversational booking system
* Booking modification workflow
* Booking cancellation workflow
* Hall availability checking
* Active meeting detection
* Real-time notifications
* Automated cron-based monitoring
* Responsive UI design

---

## Future Improvements

* Azure OpenAI Integration
* WebSocket real-time updates
* Redis-based session storage
* Role-based access control
* Admin dashboard
* Analytics & reporting
* Mobile application support

---

## Author

Sania S

---
