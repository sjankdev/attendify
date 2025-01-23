import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import Layout from "../../shared/components/EventOrganizerLayout";

const InvitationPage: React.FC = () => {
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emails, setEmails] = useState<
    { email: string; departmentId: number }[]
  >([{ email: "", departmentId: 0 }]);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailErrors, setEmailErrors] = useState<
    { email?: string; departmentId?: string }[]
  >([{ email: "", departmentId: "" }]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const companyResponse = await axios.get(
          "https://attendify-backend-el2r.onrender.com/api/auth/company",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCompanyId(companyResponse.data.id);
        setCompanyName(companyResponse.data.name);

        const departmentResponse = await axios.get(
          `https://attendify-backend-el2r.onrender.com/api/companies/${companyResponse.data.id}/departments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDepartments(departmentResponse.data);
      } catch (err: any) {
        console.error(
          "Error fetching company or department information: ",
          err
        );
        setError("Failed to fetch company or department information.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSendInvitations = async () => {
    setSuccessMessage(null);
    setError(null);

    try {
      const response = await axios.post(
        "https://attendify-backend-el2r.onrender.com/api/auth/invitation/sendBulk",
        { emails, companyId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage(response.data);
      setEmails([{ email: "", departmentId: 0 }]);
      setEmailErrors([{ email: "", departmentId: "" }]);
    } catch (err: any) {
      setError(err.response?.data || "Failed to send invitations.");
    }
  };

  const handleGoBack = () => {
    navigate("/event-organizer");
  };

  const handleAddEmail = () => {
    setEmails([...emails, { email: "", departmentId: 0 }]);
    setEmailErrors([...emailErrors, { email: "", departmentId: "" }]);
  };

  const handleRemoveEmail = (index: number) => {
    const updatedEmails = emails.filter((_, idx) => idx !== index);
    setEmails(updatedEmails);

    const updatedErrors = emailErrors.filter((_, idx) => idx !== index);
    setEmailErrors(updatedErrors);
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...emails];
    updatedEmails[index].email = value;
    setEmails(updatedEmails);

    const updatedErrors = [...emailErrors];
    if (!value.trim()) {
      updatedErrors[index].email = "Email cannot be empty.";
    } else if (!emailRegex.test(value)) {
      updatedErrors[index].email = "Please enter a valid email address.";
    } else {
      updatedErrors[index].email = undefined;
    }
    setEmailErrors(updatedErrors);
  };

  const handleDepartmentChange = (index: number, value: number) => {
    const updatedEmails = [...emails];
    if (updatedEmails[index]) {
      updatedEmails[index].departmentId = value;
    }

    const updatedErrors = [...emailErrors];
    if (value !== 0) {
      updatedErrors[index].departmentId = undefined;
    } else {
      updatedErrors[index].departmentId = "Please select a department.";
    }

    setEmails(updatedEmails);
    setEmailErrors(updatedErrors);
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600">
        Loading company and department information...
      </div>
    );
  }

  return (
    <Layout
      className="text-white"
      style={{
        backgroundImage: `url('/assets/organizer-homepage/home-bg-1.jpg')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <h2 className="text-2xl font-bold mb-2">Invite Participants</h2>
      <p className="text-sm text-white mb-6">
        Use this page to invite participants to your company on the platform.
        You can add their email addresses and select their department to help
        organize your team. Once invited, they will be able to join your events
        and activities.
      </p>
      {emails.map((emailData, index) => (
        <div key={index} className="flex flex-col space-y-4 text-white">
          <div className="flex gap-4 items-center text-white">
            <div className="w-full text-white">
              <input
                type="email"
                value={emailData.email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                placeholder="Enter participant's email"
                className={`w-full p-3 rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 ${
                  emailErrors[index]?.email
                    ? "border-red-500 focus:ring-red-500 bg-[#11011E] text-white"
                    : "border-gray-600 focus:ring-teal-500 bg-[#11011E] text-white"
                }`}
              />
              {emailErrors[index]?.email && (
                <div className="mt-2 flex items-center space-x-2 text-red-400">
                  <AiOutlineExclamationCircle className="text-lg" />
                  <p className="text-sm">{emailErrors[index]?.email}</p>
                </div>
              )}
            </div>

            <div className="w-full">
              <select
                value={emailData.departmentId}
                onChange={(e) =>
                  handleDepartmentChange(index, Number(e.target.value))
                }
                className={`w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                  emailErrors[index]?.departmentId
                    ? "border-red-500 focus:ring-red-500 bg-[#11011E] text-white"
                    : "border-gray-600 focus:ring-teal-500 bg-[#11011E] text-white"
                }`}
              >
                <option value={0} disabled>
                  Select Department
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {emailErrors[index]?.departmentId && (
                <div className="mt-2 flex items-center space-x-2 text-red-400">
                  <AiOutlineExclamationCircle className="text-lg" />
                  <p className="text-sm">{emailErrors[index]?.departmentId}</p>
                </div>
              )}
            </div>

            {emails.length > 1 && (
              <button
                onClick={() => handleRemoveEmail(index)}
                className="w-12 text-red-400 hover:text-red-600 text-sm"
              >
                X
              </button>
            )}
          </div>
        </div>
      ))}
      <div className="mb-6" />

      <div className="flex justify-start items-center gap-4">
        <button
          onClick={handleSendInvitations}
          className="w-52 px-6 py-3 bg-[#BA10AA] text-white text-sm font-medium rounded-md"
        >
          Send Invitations
        </button>
        <button
          onClick={handleAddEmail}
          className="w-52 px-6 py-3 bg-[#6167E0] text-white text-sm font-medium rounded-md"
        >
          Add Another Email
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-800 text-green-400 rounded-lg shadow-md">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-800 text-red-400 rounded-lg shadow-md">
          {error}
        </div>
      )}
    </Layout>
  );
};

export default InvitationPage;
