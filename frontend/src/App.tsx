import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './security/Login';

function App() {
  const [message, setMessage] = useState('');
  const [showLogin, setShowLogin] = useState(false); 

  return (
    <div>
      <button onClick={() => setShowLogin(true)}>Login</button>

      {showLogin && (
        <div>
          <Login />
          <button onClick={() => setShowLogin(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
