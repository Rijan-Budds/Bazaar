import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

export default function Login() {
  const navigate = useNavigate();
  const [fname, setFname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/auth/status"
        );
        if (response.data.authenticated) {
          navigate("/profile");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleRegister = () => {
    navigate("/register");
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!fname.trim() || !username.trim() || !password.trim()) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    // ======= Added admin credentials check here =======
    if (
      fname.trim() === "admin" &&
      username.trim() === "admin@admin.com" &&
      password.trim() === "admin"
    ) {
      setLoading(false);
      navigate("/admin");
      return;
    }

    // ==================================================

    try {
      const response = await axios.post("http://localhost:8081/login", {
        fname: fname.trim(),
        username: username.trim(),
        password: password.trim(),
      });

      console.log("Login response:", response.data);

      if (response.data.status === "success") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(response.data.user));

        navigate("/profile");
      } else {
        if (response.data.status === "no_record") {
          setError(
            "Invalid credentials. Please check your username and password."
          );
        } else {
          setError(response.data.message || "Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        setError(
          error.response.data.message || "Login failed. Please try again."
        );
      } else if (error.request) {
        setError("Unable to connect to server. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="login-container" style={containerStyle}>
        <div className="d-flex justify-content-between mb-3">
          <button
            onClick={handleHome}
            className="btn btn-outline-secondary"
            disabled={loading}
          >
            <i className="bi bi-house-door"></i> Home
          </button>
        </div>

        <div className="text-center mb-4">
          <h2 style={{ color: "#333", fontWeight: "600" }}>Welcome Back</h2>
          <p className="text-muted">Please sign in to your account</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="fname" className="form-label">
              <i className="bi bi-person me-2"></i>Username
            </label>
            <input
              type="text"
              id="fname"
              placeholder="Enter your username"
              className="form-control"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              disabled={loading}
              required
              style={inputStyle}
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="username" className="form-label">
              <i className="bi bi-envelope me-2"></i>Email
            </label>
            <input
              type="email"
              id="username"
              placeholder="Enter your email"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
              style={inputStyle}
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="password" className="form-label">
              <i className="bi bi-lock me-2"></i>Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-muted mb-2">Don't have an account?</p>
          <button
            onClick={handleRegister}
            className="btn btn-outline-primary"
            disabled={loading}
            style={outlineButtonStyle}
          >
            <i className="bi bi-person-plus me-2"></i>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "400px",
  border: "1px solid #e3e6f0",
};

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid #d1d3e2",
  fontSize: "14px",
  transition: "border-color 0.3s, box-shadow 0.3s",
};

const buttonStyle = {
  backgroundColor: "#bb2649",
  borderColor: "#bb2649",
  padding: "12px 24px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "16px",
  transition: "all 0.3s",
};

const outlineButtonStyle = {
  borderColor: "#bb2649",
  color: "#bb2649",
  padding: "10px 24px",
  borderRadius: "8px",
  fontWeight: "500",
  transition: "all 0.3s",
};
