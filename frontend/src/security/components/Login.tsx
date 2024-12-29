import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<LoginResponse>(
        "https://attendify-backend-el2r.onrender.com/api/auth/login",
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

  const handleRegisterRedirect = () => {
    navigate("/register-eventOrganizer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 flex items-center justify-center p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login to Attendify</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-lg font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        <div className="text-center mt-6">
          <p className="text-gray-700">Don't have an account?</p>
          <button
            onClick={handleRegisterRedirect}
            className="text-teal-600 font-semibold hover:underline"
          >
            Register as Event Organizer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
