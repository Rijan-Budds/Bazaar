import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";

axios.defaults.withCredentials = true;

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handlePostClick = (postId) => {
    window.open(`/post/${postId}`, "_blank");
  };

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/profile");

        if (response.data.status === "success") {
          setProfile(response.data.data);
        } else {
          localStorage.removeItem("isLoggedIn");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("isLoggedIn");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8081/logout");
      localStorage.removeItem("isLoggedIn");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("isLoggedIn");
      navigate("/login");
    }
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:8081/api/posts/${postId}`
      );
      if (response.data.status === "success") {
        setProfile((prev) => ({
          ...prev,
          posts: prev.posts.filter((post) => post.id !== postId),
          adsPosted: prev.adsPosted - 1,
        }));
      } else {
        alert(response.data.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Delete error:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("isLoggedIn");
        navigate("/login");
      } else {
        alert("Error deleting post");
      }
    }
  };

  if (loading) {
    return (
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userData = profile || {
    fname: "Loading...",
    email: "Loading...",
    adsPosted: 0,
    posts: [],
  };

  return (
    <div
      className="container"
      style={{ padding: "40px 15px", fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline"
          onClick={handleHome}
          style={btnOutlineStyle("#bb2649")}
        >
          🏠 Home
        </button>
        <h1
          className="text-center"
          style={{ color: "#333", fontWeight: "600" }}
        >
          My Profile
        </h1>
        <button
          className="btn btn-outline"
          onClick={handleLogout}
          style={btnOutlineStyle("#bb2649")}
        >
          🚪 Logout
        </button>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card" style={cardStyle}>
            <div className="card-header" style={headerStyle}>
              User Information
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div style={iconCircleStyle}>
                  <i
                    className="bi bi-person-fill"
                    style={{ fontSize: "2rem", color: "#bb2649" }}
                  ></i>
                </div>
                <h4 className="mb-0 ms-3">{userData.fname}</h4>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <span>📧 Email</span>
                  <span>{userData.email}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>📢 Ads Posted</span>
                  <span className="badge rounded-pill" style={badgeStyle}>
                    {userData.adsPosted}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card" style={cardStyle}>
            <div className="card-header" style={headerStyle}>
              My Ads
            </div>
            <div className="card-body">
              <p className="text-muted">
                Your posted ads will appear here. You can edit or delete them.
              </p>
              {userData.posts.length > 0 ? (
                <div className="row">
                  {userData.posts.map((post) => (
                    <div className="col-md-6 mb-3" key={post.id}>
                      <div
                        className="card"
                        style={{ ...innerCardStyle, cursor: "pointer" }}
                        onClick={() => handlePostClick(post.id)}
                      >
                        <img
                          src={`http://localhost:8081/uploads/${post.photo}`}
                          alt={post.title}
                          className="card-img-top"
                          style={{
                            height: "160px",
                            objectFit: "cover",
                            borderTopLeftRadius: "12px",
                            borderTopRightRadius: "12px",
                          }}
                        />
                        <div className="card-body">
                          <h5 className="card-title">{post.title}</h5>
                          <p className="card-text">
                            💰{" "}
                            <strong>
                              Rs. {parseFloat(post.price).toFixed(2)}
                            </strong>
                            <br />
                            📍 {post.location}
                            <br />
                            🛠️ {post.conditions}
                          </p>
                          <div className="d-flex justify-content-between">
                            <Link
                              to={`/edit-post/${post.id}`}
                              className="btn btn-sm"
                              style={btnStyle("#bb2649")}
                              onClick={(e) => e.stopPropagation()}
                            >
                              ✏️ Edit
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(post.id);
                              }}
                              className="btn btn-sm"
                              style={btnStyle("gray")}
                            >
                              ❌ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  ℹ️ You haven't posted any ads yet. Start by creating your
                  first ad!
                </div>
              )}
              <Link to="/post" className="btn mt-3" style={btnStyle("#bb2649")}>
                ➕ Create New Ad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  borderRadius: "16px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  border: "1px solid #eee",
  backgroundColor: "#fff",
};

const innerCardStyle = {
  borderRadius: "12px",
  border: "1px solid #eee",
  overflow: "hidden",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const headerStyle = {
  backgroundColor: "#bb2649",
  color: "#fff",
  padding: "12px 16px",
  borderTopLeftRadius: "16px",
  borderTopRightRadius: "16px",
  fontWeight: "600",
};

const badgeStyle = {
  backgroundColor: "#ff4d79",
  color: "#fff",
  padding: "6px 12px",
};

const iconCircleStyle = {
  backgroundColor: "#f3f4f7",
  padding: "10px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const btnStyle = (color) => ({
  backgroundColor: color,
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "8px",
  fontWeight: "500",
  fontSize: "14px",
  cursor: "pointer",
  transition: "background-color 0.3s",
});

const btnOutlineStyle = (color) => ({
  color: color,
  border: `1px solid ${color}`,
  background: "transparent",
  padding: "6px 12px",
  borderRadius: "8px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "background-color 0.3s",
});
