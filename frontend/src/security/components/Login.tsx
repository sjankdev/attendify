import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { fetchRoles } from "../services/roleService";
import { validateFormOrganizerRegistration } from "../services/validation";

interface LoginResponse {
  token: string;
  expiresIn: number;
  role: string;
  message?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSignUp, setShowSignUp] = useState<boolean>(false);
  const [errorFields, setErrorFields] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "EVENT_ORGANIZER",
    companyName: "",
    companyDescription: "",
    departmentNames: [] as string[],
  });
  const [currentDepartment, setCurrentDepartment] = useState<string>("");
  const [roles, setRoles] = useState<any[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showSignUp) {
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
    }
  }, [showSignUp]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDepartmentInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentDepartment(e.target.value);
  };

  const handleSaveDepartment = () => {
    if (
      currentDepartment &&
      !formData.departmentNames.includes(currentDepartment)
    ) {
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

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:8080/api/auth/login",
        { email, password }
      );
      localStorage.setItem("token", response.data.token);
      console.log("Login successful:", response.data);

      if (response.data.role === "EVENT_ORGANIZER") {
        navigate("/event-organizer");
      } else if (response.data.role === "EVENT_PARTICIPANT") {
        navigate("/event-participant");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
      console.error("Error logging in:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const errors = validateFormOrganizerRegistration(formData);
    if (Object.keys(errors).length > 0) {
      setErrorFields(errors);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register-organizer",
        formData
      );
      setSuccess(
        "Registration successful! Please check your email for verification."
      );
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorMessages = error.response.data;
        if (errorMessages.includes("Email already exists")) {
          setError(
            "This email is already registered. Please use a different email."
          );
        } else {
          setError(errorMessages.join(", "));
        }
      } else {
        setError("Registration failed");
      }
    }
  };

  const handleToggleForm = () => {
    setShowSignUp((prevState) => !prevState);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800 p-6">
      <div className="w-full max-w-md bg-gray-900 shadow-lg rounded-lg p-8">
        <div className="flex justify-between mb-6">
          <button
            onClick={handleToggleForm}
            className={`w-1/2 py-2 text-lg font-semibold rounded-md ${
              showSignUp
                ? "bg-gray-700 text-gray-400"
                : "bg-blue-700 text-white"
            } transition-colors`}
          >
            Sign In
          </button>
          <button
            onClick={handleToggleForm}
            className={`w-1/2 py-2 text-lg font-semibold rounded-md ${
              !showSignUp
                ? "bg-gray-700 text-gray-400"
                : "bg-blue-700 text-white"
            } transition-colors`}
          >
            Sign Up
          </button>
        </div>

        {showSignUp ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-red-500 text-sm">
                  {errorFields.email || ""}
                </p>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-red-500 text-sm">
                  {errorFields.password || ""}
                </p>
              </div>

              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-red-500 text-sm">
                  {errorFields.fullName || ""}
                </p>
              </div>

              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-red-500 text-sm">
                  {errorFields.companyName || ""}
                </p>
              </div>

              <div>
                <label
                  htmlFor="companyDescription"
                  className="block text-sm font-medium text-gray-300"
                >
                  Company Description
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-red-500 text-sm">
                  {errorFields.companyDescription || ""}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Departments
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentDepartment}
                    onChange={handleDepartmentInputChange}
                    placeholder="Add a department"
                    className="p-2 w-full border border-gray-600 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleSaveDepartment}
                    className="bg-green-700 text-white py-2 px-4 rounded-md"
                  >
                    Save
                  </button>
                </div>
                <ul className="mt-2">
                  {formData.departmentNames.map((department, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center mt-1"
                    >
                      <span className="text-gray-200">{department}</span>{" "}
                      <button
                        type="button"
                        onClick={() => handleRemoveDepartment(department)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                {errorFields.departmentNames && (
                  <p className="text-red-500 text-sm mt-2">
                    {errorFields.departmentNames}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
              >
                Register
              </button>

              {success && (
                <div className="text-green-500 text-center mt-4">{success}</div>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
                >
                  Sign In
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-center mt-4">{error}</div>
              )}
            </div>
          </form>
        )}
        <div className="text-center mt-4 text-gray-400 text-sm">
          <p>
            Note: Response times may be slower due to our free hosting plan. We
            appreciate your patience!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
