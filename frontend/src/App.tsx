import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
   const [message, setMessage] = useState('');

   useEffect(() => {
     fetch('http://localhost:8080/api/test')
       .then((response) => response.text())
       .then((data) => setMessage(data))
       .catch((error) => console.error("Error fetching data:", error));
   }, []);

   return (
     <div>
       <h1>Spring Boot and React Integration Test</h1>
       <p>Message from Spring Boot: {message}</p>
     </div>
   );
}

export default App;
