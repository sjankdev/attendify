import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EventParticipantRegister = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">("");
  const [gender, setGender] = useState<string>("");
  const [educationLevel, setEducationLevel] = useState<string>("");  
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token");
      return;
    }

    axios
      .get(`http://localhost:8080/api/auth/accept?token=${token}`)
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
      .post("http://localhost:8080/api/auth/register-participant", {
        name,
        email,
        password,
        age,
        yearsOfExperience,
        gender,
        educationLevel,  
        token,
      })
      .then(() => {
        navigate("/login");
      })
      .catch(() => {
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
            <label htmlFor="name" className="text-lg font-medium">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-4 py-3 border rounded-lg"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-lg font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-3 border rounded-lg"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="age" className="text-lg font-medium">
              Age
            </label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              required
              className="px-4 py-3 border rounded-lg"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="yearsOfExperience" className="text-lg font-medium">
              Years of Experience
            </label>
            <input
              type="number"
              id="yearsOfExperience"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(Number(e.target.value))}
              required
              className="px-4 py-3 border rounded-lg"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="gender" className="text-lg font-medium">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="px-4 py-3 border rounded-lg"
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="educationLevel" className="text-lg font-medium">
              Education Level
            </label>
            <select
              id="educationLevel"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              required
              className="px-4 py-3 border rounded-lg"
            >
              <option value="">Select Education Level</option>
              <option value="HIGH_SCHOOL">High School</option>
              <option value="BACHELOR">Bachelor</option>
              <option value="MASTER">Master</option>
              <option value="PHD">PhD</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="text-lg font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              readOnly
              className="px-4 py-3 border bg-gray-100 text-gray-500 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventParticipantRegister;
