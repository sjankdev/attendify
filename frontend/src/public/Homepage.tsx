import React from "react";
import { Link } from "react-router-dom";

const Homepage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Attendify</h1>
      <p>Please choose an option to continue:</p>
      <div>
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/register-eventOrganizer">
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
};

export default Homepage;
