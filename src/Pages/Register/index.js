import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [fname, setFname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    navigate("/login");
  };

  function handleSubmit(event) {
    event.preventDefault();

    axios
      .post("http://localhost:8081/register", {fname, username, password })
      .then((res) => {
        console.log(res);
        if (res.data.status === "success") {
          alert("Registration successful!");
          navigate("/login"); 
        } else {
          alert(res.data.message); 
        }
      })
      .catch((err) => console.log(err));
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="login-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fname">Username</label>
            <input
              type="text"
              id="fname"
              placeholder="Enter Username"
              className="form-control"
              onChange={(e) => setFname(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="username"
              placeholder="Enter email"
              className="form-control"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              className="form-control"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary mt-3">
            Register
          </button>
        </form>
        <button onClick={handleLogin} className="btn btn-primary mt-3">
          Login
        </button>
      </div>
    </div>
  );
}
