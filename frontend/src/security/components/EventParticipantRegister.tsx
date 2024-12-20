import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EventParticipantRegister = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token");
      return;
    }

    axios
      .get(`https://attendify-backend-el2r.onrender.com/api/auth/accept?token=${token}`)
      .then((response) => {
        setEmail(response.data.email); 
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Error fetching invitation.");
      });
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    axios
      .post("https://attendify-backend-el2r.onrender.com/api/auth/register-participant", {
        name,
        email,
        password,
        token,
      })
      .then((response) => {
        navigate("/login");
      })
      .catch((err) => {
        setError("Error registering participant.");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Complete Your Registration
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="text-lg font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-lg font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-lg font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              readOnly
              className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
          >
            Register
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-700">Already registered? <span className="text-teal-600 font-semibold hover:underline cursor-pointer" onClick={() => navigate("/login")}>Login</span></p>
        </div>
      </div>
    </div>
  );
};

export default EventParticipantRegister;
