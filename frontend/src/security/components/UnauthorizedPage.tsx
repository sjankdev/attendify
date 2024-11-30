import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const handleGoBack = () => {
    if (role === "EVENT_ORGANIZER") {
      navigate("/event-organizer");
    } else if (role === "EVENT_PARTICIPANT") {
      navigate("/event-participant");
    } else {
      navigate("/");
    }
  };

  if (!role) {
    setError("Unauthorized access. You don't have a valid role.");
  }

  return (
    <div>
      <h1>403 - Access Denied</h1>
      <p>{error || "You do not have permission to access this page."}</p>

      <button onClick={handleGoBack}>Go Back</button>
    </div>
  );
};

export default UnauthorizedPage;
