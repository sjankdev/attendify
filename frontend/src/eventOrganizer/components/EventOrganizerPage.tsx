import React, { useEffect, useState } from "react";
import axios from "axios";

const EventOrganizerPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://attendify-backend-el2r.onrender.com/api/auth/company",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCompanyId(response.data.id);
      } catch (err: any) {
        setError("Failed to fetch company information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendInvitation = async () => {
    setSuccessMessage(null);
    setError(null);

    if (!companyId) {
      setError("Company ID is not available.");
      return;
    }

    console.log("Sending invitation with email: ", email);

    try {
      const response = await axios.post(
        "https://attendify-backend-el2r.onrender.com/api/auth/invitation/send",
        { email, companyId },
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
