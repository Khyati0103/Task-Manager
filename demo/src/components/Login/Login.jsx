import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate(); 

  const handleSubmit = (e) => {
    e.preventDefault();

   
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('username', username);

    localStorage.setItem('email', email);
    localStorage.setItem('username', username);

   
    navigate('/home');
  };

  return (
    <div className="Login-container">
      <form className="Login-form" onSubmit={handleSubmit}>
        <h2 className="Login-title">LOGIN</h2>
        <div className="Box">
          <div className="Email">
            <label htmlFor="email">Email: </label>
            <input
              type="email"
              id="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="username">
            <label htmlFor="username">Username: </label>
            <input
              type="text"
              id="username"
              placeholder="Enter Your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="password">
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              id="password"
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="login-button">
          LOGIN
        </button>
      </form>
    </div>
  );
};
