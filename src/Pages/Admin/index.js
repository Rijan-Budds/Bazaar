import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;

export default function AdminPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAllPosts = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/admin/posts");
      if (response.data.status === "success") {
        setPosts(response.data.data);
      } else {
        alert("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("isLoggedIn");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await axios.delete(`http://localhost:8081/api/posts/${postId}`);
      if (response.data.status === "success") {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        alert(response.data.message || "Failed to delete post");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting post");
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading posts...</p>;
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "'Poppins', sans-serif" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-outline-danger">
          Logout
        </button>
      </div>

      {posts.length > 0 ? (
        <div className="row">
          {posts.map((post) => (
            <div className="col-md-4 mb-3" key={post.id}>
              <div className="card">
                <img
                  src={`http://localhost:8081/uploads/${post.photo}`}
                  alt={post.title}
                  className="card-img-top"
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{post.title}</h5>
                  <p className="card-text">
                    Rs. {parseFloat(post.price).toFixed(2)} <br />
                    📍 {post.location} <br />
                    🛠️ {post.conditions}
                  </p>
                  <div className="d-flex justify-content-between">
                    <Link
                      to={`/edit-post/${post.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="btn btn-sm btn-danger"
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
        <p>No posts found.</p>
      )}
    </div>
  );
}
