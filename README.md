# KONVO - Video Conferencing Platform

KONVO is a full-stack, real-time video conferencing application designed to provide seamless communication, meeting management, and history tracking. 

---

## 🚀 Features

* **Real-Time Video & Audio:** High-quality video and voice communication powered by WebSockets and WebRTC elements via Socket.io.
* **Authentication & Authorization:** Secure user login and registration with token-based session protection.
* **Meeting Management:** Create instantly available meeting spaces or join existing ones using unique codes.
* **Responsive UI:** Clean, fluid, component-driven user interface built using modern CSS styling.
* **Screen Sharing:** Incorporate structural elements to allow users to broadcast their displays alongside video streams.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React.js, JavaScript 
* **Build Tool:** Vite
* **State Management:** React Context API (`AuthContext`)
* **Styling:** CSS Modules, Vanilla CSS

### Backend
* **Runtime:** Node.js
* **Database:** MongoDB (via Mongoose)
* **Real-time Communication:** Socket.io
* **Authentication:** JSON Web Tokens (JWT), bcryptjs

---

## 📂 Project Structure

```
KONVO/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── socketManager.js
│   │   │   └── user.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── models/
│   │   │   ├── history.model.js
│   │   │   ├── meeting.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   └── users.routes.js
│   │   └── app.js
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── bg.jpg
│   │   ├── img.jpg
│   │   ├── logo3.png
│   │   └── mobile.png
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Auth.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Home.css
│   │   │   ├── Home.jsx
│   │   │   ├── Landing.jsx
│   │   │   └── VideoMeet.jsx
│   │   ├── styles/
│   │   │   └── VideoMeet.module.css
│   │   ├── utils/
│   │   │   └── withAuth.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── enviroment.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Deployment
* Render

--- 

# 🔮 Future Improvements
* **Meeting History:** View detailed logs of past meetings linked directly to user accounts.
* **In-Meeting Chat:** Add a text-based sidebar chat container using existing Socket channels during active calls.
* **Recording Capabilities:** Introduce server-side or client-side video stream capturing to download or save meetings.
* **Whiteboard Integration:** Provide a collaborative canvas board component for team brainstorming.
* **Participant Controls:** Build host features like muting participants, kicking users, or locking the meeting room.