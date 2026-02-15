# Deadlock

Deadlock is a full-stack competitive game platform built using the MERN stack.  
It is designed as a multi-stage elimination game where participants compete through structured rounds until a single winner emerges.

The project focuses on backend game logic, match state management, elimination handling, and structured full-stack architecture.

---

## Game Structure

Deadlock is played in two main stages:

### Round 1 – 1 vs 1 Tug of War

- Players compete head-to-head.
- Each match determines a winner and a loser.
- Winners advance to the next stage.
- Losers are eliminated from the competition.

This round acts as the primary elimination phase.

### Round 2 – Battle Royale: Reverse Engineering (Crack the Code)

- All selected winners enter a competitive “Crack the Code” session.
- Players attempt to solve a reverse engineering challenge.
- The system tracks progress and results.
- Only one final winner emerges.

The game flow ensures structured elimination and controlled state transitions until a single champion is determined.

---

## Features

- Multiple players competing simultaneously
- 1 vs 1 elimination round handling
- Final battle royale reverse engineering round
- Dynamic match state transitions (Pending → Active → Crack The Code → Result)
- Admin-controlled match lifecycle
- Backend support for dynamic number of questions
- Structured API design

---

## Tech Stack

Frontend:
- React
- Axios

Backend:
- Node.js
- Express
- MongoDB
- Mongoose

---

## Project Structure

Deadlock/
│
├── frontend/
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── services/
│ └── middleware/
└── README.md


---

## Installation

### Clone the repository

git clone https://github.com/vakeer56/Deadlock.git

cd Deadlock


### Backend setup

cd backend
npm install


Create a `.env` file inside the backend directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string


Start the backend:

npm run dev


### Frontend setup

Open another terminal:

cd frontend
npm install
npm start


---

## Scripts

Backend:
- `npm run dev` – start development server
- `npm start` – start production server

Frontend:
- `npm start` – start development server
- `npm run build` – build production version
