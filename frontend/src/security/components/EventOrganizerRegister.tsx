import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRoles } from "../services/roleService";
import axios from "axios";
import { validateFormOrganizerRegistration } from "../services/validation";

interface Role {
  id: number;
  name: string;
}

interface RegisterUserDto {
  email: string;
  password: string;
  fullName: string;
  role: string;
  companyName: string;
  companyDescription: string;
  departmentNames: string[]; 
}

const EventOrganizerRegister: React.FC = () => {
  const [formData, setFormData] = useState<RegisterUserDto>({
    email: "",
    password: "",
    fullName: "",
    role: "EVENT_ORGANIZER",
    companyName: "",
    companyDescription: "",
    departmentNames: [], 
  });

  const [currentDepartment, setCurrentDepartment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRolesData = async () => {
      try {
        console.log("Fetching roles...");
        const rolesData = await fetchRoles();
        setRoles(rolesData);
      } catch (error) {
        setError("Failed to load roles");
      }
    };

    fetchRolesData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDepartmentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDepartment(e.target.value);
  };

  const handleSaveDepartment = () => {
    if (currentDepartment && !formData.departmentNames.includes(currentDepartment)) {
      setFormData({
        ...formData,
        departmentNames: [...formData.departmentNames, currentDepartment],
      });
      setCurrentDepartment(""); 
    }
  };

  const handleRemoveDepartment = (department: string) => {
    setFormData({
      ...formData,
      departmentNames: formData.departmentNames.filter(
        (dept) => dept !== department
      ),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateFormOrganizerRegistration(formData, setError)) {
      return;
    }

    try {
      const response = await axios.post(
        "https://attendify-backend-el2r.onrender.com/api/auth/register-organizer",
        formData
      );
      setSuccess(
        "Registration successful! Please check your email for verification."
      );
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorMessages = error.response.data;
        if (errorMessages.includes("Email already exists")) {
          setError("This email is already registered. Please use a different email.");
        } else {
          setError(errorMessages.join(", "));
        }
      } else {
        setError("Registration failed");
      }
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-500 via-green-500 to-blue-500 flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Event Organizer Registration
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-lg font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-lg font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="fullName" className="text-lg font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="companyName" className="text-lg font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="companyDescription" className="text-lg font-medium text-gray-700">
              Company Description
            </label>
            <textarea
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium text-gray-700">Departments</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                name="departmentName"
                value={currentDepartment}
                onChange={handleDepartmentInputChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Add a department"
              />
              <button
                type="button"
                onClick={handleSaveDepartment}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
            <ul>
              {formData.departmentNames.map((department, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{department}</span>
                  <span className="text-green-500">✔</span> 
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(department)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-700">Already have an account?</p>
          <button
            onClick={handleLoginRedirect}
            className="text-teal-600 font-semibold hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventOrganizerRegister;
