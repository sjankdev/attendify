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
      .get(`https://attendify-backend-el2r.onrender.com/event-participant/api/auth/accept?token=${token}`)
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
      .post("https://attendify-backend-el2r.onrender.com/event-participant/api/auth/register-participant", {
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
    <div>
      <h2>Complete Your Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} readOnly />
        </div>
        <button type="submit">Register</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default EventParticipantRegister;
