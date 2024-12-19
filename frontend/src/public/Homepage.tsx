import React from "react";
import { Link } from "react-router-dom";

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-6 text-white">
      <h1 className="text-4xl font-extrabold mb-4 text-center">
        Welcome to <span className="text-yellow-300">Attendify</span>
      </h1>
      <p className="text-xl font-medium mb-8 text-center max-w-2xl">
        The all-in-one platform for managing your events and connecting with participants. Choose an option to get started.
      </p>
      <div className="flex gap-8">
        <Link to="/login">
          <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-xl hover:bg-blue-700 transition duration-300 transform hover:scale-105">
            Login
          </button>
        </Link>
        <Link to="/register-eventOrganizer">
          <button className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-xl hover:bg-green-700 transition duration-300 transform hover:scale-105">
            Register
          </button>
        </Link>
      </div>
      <footer className="absolute bottom-8 text-white text-sm">
        <p>&copy; 2024 Attendify. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;
