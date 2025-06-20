import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const containerStyle = {
  fontFamily: "'Poppins', sans-serif",
  padding: "40px 15px",
  maxWidth: "900px",
  margin: "0 auto",
};

const cardStyle = {
  borderRadius: "16px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  border: "1px solid #eee",
  backgroundColor: "#fff",
};

const cardHeaderStyle = {
  backgroundColor: "#bb2649",
  color: "#fff",
  padding: "12px 20px",
  borderTopLeftRadius: "16px",
  borderTopRightRadius: "16px",
  fontWeight: "600",
  fontSize: "20px",
};

const formLabelStyle = {
  fontWeight: "600",
  color: "#333",
};

const inputStyle = {
  borderRadius: "10px",
  border: "1px solid #ddd",
  padding: "10px 15px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.3s",
};

const btnPrimaryStyle = {
  backgroundColor: "#bb2649",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  padding: "10px 20px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background-color 0.3s",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const btnSecondaryStyle = {
  backgroundColor: "#6c757d",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  padding: "10px 20px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const imgThumbnailStyle = {
  maxWidth: "200px",
  height: "auto",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
};

export default function Edit() {
  const [post, setPost] = useState({
    title: '',
    category: '',
    conditions: '',
    description: '',
    price: '',
    negotiable: false,
    location: '',
    photo: ''
  });
  const [newPhoto, setNewPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    fetchPost();
  }, [id, navigate]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/posts/${id}`);
      if (response.data.status === "success") {
        setPost(response.data.data);
      } else {
        setError("Failed to fetch post details");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("Error loading post details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setNewPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', post.title);
    formData.append('category', post.category);
    formData.append('conditions', post.conditions);
    formData.append('description', post.description);
    formData.append('price', post.price);
    formData.append('negotiable', post.negotiable);
    formData.append('location', post.location);
    
    if (newPhoto) {
      formData.append('photo', newPhoto);
    }

    try {
      const response = await axios.put(`http://localhost:8081/api/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status === "success") {
        alert("Post updated successfully!");
        navigate("/profile");
      } else {
        alert("Failed to update post: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error updating post");
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading post details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/profile")}
            style={{ backgroundColor: "#bb2649", border: "none" }}
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const handleFocus = (e) => {
    e.target.style.borderColor = "#bb2649";
    e.target.style.boxShadow = "0 0 0 2px rgba(187, 38, 73, 0.2)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "#ddd";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={containerStyle}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h4 className="mb-0">Edit Post</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-3">
                  <label htmlFor="title" className="form-label" style={formLabelStyle}>
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={post.title}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Category */}
                <div className="mb-3">
                  <label htmlFor="category" className="form-label" style={formLabelStyle}>
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={post.category}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Condition */}
                <div className="mb-3">
                  <label htmlFor="conditions" className="form-label" style={formLabelStyle}>
                    Condition *
                  </label>
                  <select
                    id="conditions"
                    name="conditions"
                    value={post.conditions}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    <option value="">Select Condition</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label htmlFor="description" className="form-label" style={formLabelStyle}>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={post.description}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Price */}
                <div className="mb-3">
                  <label htmlFor="price" className="form-label" style={formLabelStyle}>
                    Price (रु) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="price"
                    name="price"
                    value={post.price}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Negotiable */}
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="negotiable"
                    name="negotiable"
                    checked={post.negotiable}
                    onChange={handleInputChange}
                    style={{ cursor: "pointer" }}
                  />
                  <label className="form-check-label" htmlFor="negotiable" style={{ cursor: "pointer", fontWeight: "600", color: "#333" }}>
                    Price is negotiable
                  </label>
                </div>

                {/* Location */}
                <div className="mb-3">
                  <label htmlFor="location" className="form-label" style={formLabelStyle}>
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={post.location}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Current Photo Display */}
                {post.photo && (
                  <div className="mb-3">
                    <label className="form-label" style={formLabelStyle}>
                      Current Photo
                    </label>
                    <div>
                      <img
                        src={`http://localhost:8081/uploads/${post.photo}`}
                        alt="Current post"
                        style={imgThumbnailStyle}
                      />
                    </div>
                  </div>
                )}

                {/* New Photo Upload */}
                <div className="mb-3">
                  <label htmlFor="photo" className="form-label" style={formLabelStyle}>
                    {post.photo ? "Change Photo (optional)" : "Upload Photo *"}
                  </label>
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={inputStyle}
                  />
                  <div className="form-text" style={{ fontSize: "13px", color: "#666" }}>
                    {post.photo ? "Leave empty to keep current photo" : "Please upload a photo"}
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    style={btnPrimaryStyle}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#9a1d3a")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#bb2649")}
                  >
                    <i className="bi bi-save"></i> Update Post
                  </button>
                  <button
                    type="button"
                    style={btnSecondaryStyle}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#5a6268")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#6c757d")}
                    onClick={handleCancel}
                  >
                    <i className="bi bi-x-circle"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
