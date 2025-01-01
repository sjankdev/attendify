import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiOutlineExclamationCircle } from "react-icons/ai";

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
          "http://localhost:8080/api/auth/company",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCompanyId(companyResponse.data.id);
        setCompanyName(companyResponse.data.name);

        const departmentResponse = await axios.get(
          `http://localhost:8080/api/companies/${companyResponse.data.id}/departments`,
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
        "http://localhost:8080/api/auth/invitation/sendBulk",
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h2 className="text-3xl font-semibold text-center text-gray-800">
        Invite Participants
      </h2>

      {emails.map((emailData, index) => (
        <div key={index} className="flex flex-col space-y-4">
          <div className="flex gap-4 items-center">
            <div className="w-full">
              <input
                type="email"
                value={emailData.email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                placeholder="Enter participant's email"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  emailErrors[index]?.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-teal-500"
                }`}
              />
              {emailErrors[index]?.email && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
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
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  emailErrors[index]?.departmentId
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-teal-500"
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
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AiOutlineExclamationCircle className="text-lg" />
                  <p className="text-sm">{emailErrors[index]?.departmentId}</p>
                </div>
              )}
            </div>

            {emails.length > 1 && (
              <button
                onClick={() => handleRemoveEmail(index)}
                className="text-red-500 ml-2 hover:text-red-700"
              >
                X
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center space-x-4">
        <button
          onClick={handleAddEmail}
          className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition duration-200"
        >
          Add another email
        </button>
        <button
          onClick={handleSendInvitations}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
        >
          Send Invitations
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg shadow-md">
          {successMessage}
        </div>
      )}

      <div className="flex justify-between space-x-4">
        <button
          onClick={handleGoBack}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200"
        >
          Go Back
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default InvitationPage;
