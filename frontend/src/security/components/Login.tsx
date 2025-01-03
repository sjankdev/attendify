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

  const handleRegisterRedirect = () => {
    navigate("/register-eventOrganizer");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#2A3439]">
      <div className="flex w-[1200px] h-[800px] -ml-8 -mt-8">
        <div className="w-[600px] bg-[#DD3F43] flex items-center justify-center flex-col">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold text-white text-center mb-4">
              Simplify Event Planning
            </h1>
            <h1 className="text-3xl font-medium text-white text-center">
              and Connect with Your Audience
            </h1>
          </div>
          <img
            src="/assets/logos/login-logo.png"
            alt="Event Logo"
            className="w-[450px] mt-12"
          />
        </div>
        <div className="w-[600px] bg-[#0F213E] flex items-center justify-center relative">
          <div className="absolute top-8 right-4 flex space-x-4">
            <div className="flex rounded-lg overflow-hidden">
              <button className="w-[100px] bg-[#DD3F43] text-white py-1 font-semibold hover:bg-[#D03A3E] rounded-l-lg">
                Sign In
              </button>
              <button className="w-[100px] bg-[#7A7A7A] text-white py-1 font-semibold hover:bg-[#626262] rounded-r-lg">
                Sign Up
              </button>
            </div>
          </div>

          <form
            className="w-full max-w-[500px] p-8 rounded-lg"
            onSubmit={handleLogin}
          >
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-lg font-medium text-[#CFD0C6]"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-2 border-b border-[#BCB6AE] bg-transparent focus:outline-none focus:ring-0 p-3 text-white"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-lg font-medium text-[#CFD0C6]"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mt-2 border-b border-[#BCB6AE] bg-transparent focus:outline-none focus:ring-0 p-3 text-white"
              />
            </div>
            <div className="mb-6 flex justify-start mt-16">
              <button
                type="submit"
                disabled={loading}
                className={`w-[140px] py-1.5 px-5 text-white font-semibold rounded-xl text-lg text-center ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#DD3F43] hover:bg-[#D03A3E]"
                }`}
              >
                Sign In
              </button>
            </div>
            {error && (
              <p className="mt-4 text-lg text-red-600 text-center">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
