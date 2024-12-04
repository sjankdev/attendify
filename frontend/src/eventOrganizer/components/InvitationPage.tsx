import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const InvitationPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyData = async () => {
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
        setCompanyName(response.data.name);
      } catch (err: any) {
        console.error("Error fetching company information: ", err);
        setError("Failed to fetch company information.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const handleSendInvitation = async () => {
    setSuccessMessage(null);
    setError(null);

    if (!companyId) {
      setError("Company ID is not available.");
      return;
    }

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
    } catch (err: any) {
      console.error("Error sending invitation: ", err);
      setError(err.response?.data || "Failed to send the invitation.");
    }
  };

  const handleGoBack = () => {
    navigate("/event-organizer");
  };

  if (loading) {
    return <div>Loading company information...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div>
      <h2>Invite Participants</h2>
      {companyName && (
        <p>
          Company: <strong>{companyName}</strong>
        </p>
      )}
      <div>
        <h3>Send Invitation</h3>
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

      <button
        onClick={handleGoBack}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Go Back
      </button>
    </div>
  );
};

export default InvitationPage;
