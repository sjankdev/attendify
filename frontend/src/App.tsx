import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Login from "./security/components/Login";
import Register from "./security/components/Registration";
import EventOrganizerPage from "./eventOrganizer/components/EventOrganizerPage";
import Homepage from "./public/Homepage";
import EventParticipantPage from "./eventParticipant/components/EventParticipantPage";
import UnauthorizedPage from "./security/components/UnauthorizedPage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/event-organizer" element={<EventOrganizerPage />} />
          <Route path="/event-participant" element={<EventParticipantPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
