import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Login from "./security/components/Login";
import EventOrganizerPage from "./eventOrganizer/components/EventOrganizerPage";
import EventParticipantPage from "./eventParticipant/components/EventParticipantPage";
import EventParticipantRegister from "./security/components/EventParticipantRegister";
import InvitationPage from "./eventOrganizer/components/InvitationPage";
import CreateEventPage from "./eventOrganizer/components/CreateEventPage";
import ListEventsPage from "./eventOrganizer/components/ListEventsPage";
import UpdateEventPage from "./eventOrganizer/components/UpdateEventPage";
import CompanyParticipantsPage from "./eventOrganizer/components/CompanyParticipantsPage";
import EventStatisticsPage from "./eventOrganizer/components/EventStatisticsPage";
import DepartmentsList from "./eventOrganizer/components/DepartmentsList";
import EventDetailPage from "./eventOrganizer/components/EventDetailsPage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
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
            path="/event-organizer/company-departments"
            element={<DepartmentsList />}
          />
          <Route
            path="/event-details/:eventId"
            element={<EventDetailPage />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
