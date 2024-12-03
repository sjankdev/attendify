import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRoles } from "../services/roleService";
import axios from "axios";

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
}

const EventOrganizerRegister: React.FC = () => {
  const [formData, setFormData] = useState<RegisterUserDto>({
    email: "",
    password: "",
    fullName: "",
    role: "EVENT_ORGANIZER",
    companyName: "",
    companyDescription: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register-organizer",
        formData
      );
      setSuccess(
        "Registration successful! Please check your email for verification."
      );
    } catch (error: any) {
      setError(error.response?.data?.message || "Registration failed");
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Company Name:</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Company Description:</label>
          <textarea
            name="companyDescription"
            value={formData.companyDescription}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <div style={{ marginTop: "10px" }}>
        <p>Already have an account?</p>
        <button onClick={handleLoginRedirect}>Login</button>
      </div>
    </div>
  );
};

export default EventOrganizerRegister;
