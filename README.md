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
## Images

![WhatsApp Image 2026-03-07 at 10 48 10 PM(4)](https://github.com/user-attachments/assets/dd5a09a1-7fd4-4ad6-aec2-a4260b3e47a9)
![WhatsApp Image 2026-03-07 at 10 48 10 PM(3)](https://github.com/user-attachments/assets/0377f2b1-4b1d-4a70-9536-89abb1f9d3aa)
![WhatsApp Image 2026-03-07 at 10 48 10 PM(2)](https://github.com/user-attachments/assets/a4b53652-8fa5-4017-b7da-2d6c81a9d6b6)
![WhatsApp Image 2026-03-07 at 10 48 10 PM(1)](https://github.com/user-attachments/assets/8c21e7e4-3b01-46e1-be24-2e48891beb33)
![WhatsApp Image 2026-03-07 at 10 48 10 PM](https://github.com/user-attachments/assets/a07f9aab-61c4-4ccb-8a9a-f36144f80b4d)
![WhatsApp Image 2026-03-07 at 10 48 09 PM(2)](https://github.com/user-attachments/assets/d3b62d94-f7fe-4953-b8df-f25f748e422d)
![WhatsApp Image 2026-03-07 at 10 48 09 PM(1)](https://github.com/user-attachments/assets/3a62d70f-e6e6-46e2-8fca-b6b9bd3cee2c)
![WhatsApp Image 2026-03-07 at 10 48 09 PM](https://github.com/user-attachments/assets/309bda13-651f-4b6c-a032-87249fd47622)
<img width="300" height="168" alt="arch" src="https://github.com/user-attachments/assets/0f1cae59-16e8-4b0e-bc37-d5d9476f87a9" />
