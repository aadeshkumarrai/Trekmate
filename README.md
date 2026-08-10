# TrekMate AI

TrekMate AI is a full-stack trekking management platform with role-based dashboards, trek booking, staff management and an AI-powered travel assistant.

## Features

### User / Trekker

- Create and manage a trekker account
- Browse and filter available treks
- Book a trek for multiple participants
- View and cancel active bookings
- View completed trekking history
- Access a personalized dashboard
- Ask trekking and travel questions through TrekMate AI

### Trek Staff

- Register as trek staff
- Wait for admin approval before login
- View assigned treks
- View booked participants
- Start an assigned trek
- Mark an in-progress trek as completed
- Automatically update related bookings after completion

### Admin

- View live dashboard statistics
- Approve or reject staff registrations
- Create, update and delete treks
- Assign approved staff to treks
- View and filter all bookings
- Monitor users, treks, staff requests and bookings

### AI Assistant

- Powered by the Groq API
- Supports English, Hindi and Hinglish
- Provides trekking, packing, budget and itinerary suggestions
- Stores user-specific chat history in MongoDB
- Restores chat history after refresh or login
- Allows users to clear their saved chat history

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens
- HTTP-only cookies
- bcrypt
- Groq SDK

### Security

- Password hashing with bcrypt
- JWT authentication
- HTTP-only authentication cookies
- Role-based authorization
- Helmet security headers
- API rate limiting
- Request body size limits
- Protected API routes
- Environment-based secrets

## Project Structure

```text
trekmate-ai/
├── client/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── context/
│       └── pages/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   └── server.js
│
├── .gitignore
└── README.md
```

## User Roles

| Role | Access |
|---|---|
| User | Browse treks, book treks, view bookings and history |
| Staff | View assigned treks, participants and update trek progress |
| Admin | Manage staff, treks, bookings and dashboard statistics |

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd trekmate-ai
```

### 2. Configure the backend

```bash
cd server
npm install
cp .env.example .env
```

Add your real values to `server/.env`:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=7d

ADMIN_NAME=TrekMate Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_strong_admin_password

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

Never commit the real `.env` file.

### 3. Create the admin account

From the `server` directory:

```bash
node scripts/createAdmin.js
```

### 4. Start the backend

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5001
```

Health endpoint:

```text
http://localhost:5001/api/health
```

### 5. Configure and start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Main API Modules

| Module | Base Route |
|---|---|
| Authentication | `/api/auth` |
| Admin | `/api/admin` |
| Treks | `/api/treks` |
| Bookings | `/api/bookings` |
| AI Chat | `/api/chat` |

## Main Workflow

1. A user registers as a trekker or trek staff.
2. Trekker accounts can log in immediately.
3. Staff accounts require admin approval.
4. Admin creates a trek and assigns approved staff.
5. A trekker books an available trek.
6. Available slots are reduced automatically.
7. Assigned staff can view booked participants.
8. Staff starts and completes the trek.
9. Related bookings are moved to completed status.
10. The completed trek appears in the user’s trekking history.

## Available Scripts

### Client

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Server

```bash
npm run dev
npm start
```

## Production Build

From the `client` directory:

```bash
npm run lint
npm run build
```

The optimized frontend build is generated inside:

```text
client/dist
```

## Important Notes

- TrekMate AI does not provide live weather, permit or route-closure information.
- Users should verify current conditions from official sources.
- Groq API usage is subject to the limits of the configured Groq account.
- Admin credentials and API keys must remain inside the private `.env` file.