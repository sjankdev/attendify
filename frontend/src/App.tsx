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
import EventParticipantRegister from "./security/components/EventParticipantRegister";
import InvitationPage from "./eventOrganizer/components/InvitationPage";
import CreateEventPage from "./eventOrganizer/components/CreateEventPage";
import ListEventsPage from "./eventOrganizer/components/ListEventsPage";
import UpdateEventPage from "./eventOrganizer/components/UpdateEventPage";
import CompanyParticipantsPage from "./eventOrganizer/components/CompanyParticipantsPage";
import EventDetailsPage from "./eventOrganizer/components/EventDetailsPage";
import EventStatisticsPage from "./eventOrganizer/components/EventStatisticsPage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/register-eventOrganizer"
            element={<EventOrganizerRegister />}
          />
          <Route path="/event-organizer" element={<EventOrganizerPage />} />
          <Route path="/event-participant" element={<EventParticipantPage />} />
          <Route
            path="/register-participant"
            element={<EventParticipantRegister />}
          />
          <Route
            path="/event-organizer/invitations"
            element={<InvitationPage />}
          />
          <Route
            path="/event-organizer/create-event"
            element={<CreateEventPage />}
          />
          <Route path="/event-organizer/events" element={<ListEventsPage />} />
          <Route
            path="/event-organizer/update-event/:eventId"
            element={<UpdateEventPage />}
          />
          <Route
            path="/event-organizer/company-participants"
            element={<CompanyParticipantsPage />}
          />
          <Route
            path="/event-stats/:eventId"
            element={<EventStatisticsPage />}
          />
          <Route
            path="/event-details/:eventId"
            element={<EventDetailsPage />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
