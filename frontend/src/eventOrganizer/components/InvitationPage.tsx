import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../shared/components/Layout";

const InvitationPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSendInvitation = async () => {
    setSuccessMessage(null);
    setError(null);
    setEmailError(null);

    if (!email.trim()) {
      setEmailError("Please enter an email address.");
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

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
      setEmail("");
    } catch (err: any) {
      console.error("Error sending invitation: ", err);
      setError(err.response?.data || "Failed to send the invitation.");
    }
  };

  const handleGoBack = () => {
    navigate("/event-organizer");
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600">
        Loading company information...
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            Invite Participants
          </h2>

          {companyName && (
            <p className="text-lg text-center mb-4">
              Company: <strong>{companyName}</strong>
            </p>
          )}

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Send Invitation
            </h3>
            <div className="flex flex-col space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter participant's email"
                className={`px-4 py-3 border ${
                  emailError ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 ${
                  emailError ? "focus:ring-red-500" : "focus:ring-teal-500"
                }`}
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}

              <button
                onClick={handleSendInvitation}
                className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
              >
                Send Invitation
              </button>
            </div>

            {successMessage && (
              <div className="mt-4 text-green-600 text-center">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mt-4 text-red-500 text-center">{error}</div>
            )}

            <button
              onClick={handleGoBack}
              className="mt-6 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvitationPage;
