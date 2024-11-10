import React, { useState } from "react";
import "./App.css";
import Login from "./security/components/Login";
import Register from "./security/components/Registration";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import EventOrganizerPage from "./eventOrganizer/components/EventOrganizerPage";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <Router>
      <div>
        <button onClick={() => setShowLogin(true)}>Login</button>
        <button onClick={() => setShowRegister(true)}>Register</button>

        {showLogin && (
          <div>
            <Login />
            <button onClick={() => setShowLogin(false)}>Close</button>
          </div>
        )}

        {showRegister && (
          <div>
            <Register />
            <button onClick={() => setShowRegister(false)}>Close</button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<EventOrganizerPage />} />
          <Route path="/event-organizer" element={<EventOrganizerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
