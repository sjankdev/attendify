import React, { useState } from 'react';
import './App.css';
import Login from './security/Login';
import Register from './security/Registration';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div>
      <button onClick={() => setShowLogin(true)}>Login</button>
      <button onClick={() => setShowRegister(true)}>Register</button>

      {showLogin && (
        <div>
          <Login />
          <button onClick={() => setShowLogin(false)}>Close</button>
        </div>
      )}

      {showRegister && (
        <div>
          <Register />
          <button onClick={() => setShowRegister(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
