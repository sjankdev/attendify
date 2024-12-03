import React, { useEffect, useState } from "react";
import axios from "axios";

const EventOrganizerPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/event-organizer/home",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMessage(response.data);
      } catch (err: any) {
        setError("You are not authorized or something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendInvitation = async () => {
    setSuccessMessage(null);
    setError(null);

    console.log("Sending invitation with email: ", email);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/invitation/send",
        { email, companyId: 1 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage(response.data);

      console.log(`Invitation sent successfully to: ${email}`);
    } catch (err: any) {
      console.error("Error sending invitation: ", err);
      setError(err.response?.data || "Failed to send the invitation.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div>
      {message && <div>{message}</div>}
      <p>Hello event organizer</p>

      <div>
        <h3>Invite Participant</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter participant's email"
          style={{ padding: "10px", width: "300px" }}
        />
        <button
          onClick={handleSendInvitation}
          style={{
            padding: "10px 20px",
            marginLeft: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send Invitation
        </button>
      </div>

      {successMessage && (
        <div style={{ color: "green", marginTop: "10px" }}>
          {successMessage}
        </div>
      )}
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
    </div>
  );
};

export default EventOrganizerPage;
