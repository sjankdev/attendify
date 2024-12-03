import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Login from "./security/components/Login";
import EventOrganizerRegister from "./security/components/EventOrganizerRegister";
import EventOrganizerPage from "./eventOrganizer/components/EventOrganizerPage";
import Homepage from "./public/Homepage";
import EventParticipantPage from "./eventParticipant/components/EventParticipantPage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<EventOrganizerRegister />} />
          <Route path="/event-organizer" element={<EventOrganizerPage />} />
          <Route path="/event-participant" element={<EventParticipantPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;