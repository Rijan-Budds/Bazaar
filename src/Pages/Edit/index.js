import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

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

    // Fetch post details
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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
      <div className="container mt-4">
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
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/profile")}>
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Edit Post</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Title */}
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={post.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Category */}
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category *</label>
                  <select
                    className="form-control"
                    id="category"
                    name="category"
                    value={post.category}
                    onChange={handleInputChange}
                    required
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
                  <label htmlFor="conditions" className="form-label">Condition *</label>
                  <select
                    className="form-control"
                    id="conditions"
                    name="conditions"
                    value={post.conditions}
                    onChange={handleInputChange}
                    required
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
                  <label htmlFor="description" className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={post.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Price (रु) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="price"
                    name="price"
                    value={post.price}
                    onChange={handleInputChange}
                    required
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
                  />
                  <label className="form-check-label" htmlFor="negotiable">
                    Price is negotiable
                  </label>
                </div>

                {/* Location */}
                <div className="mb-3">
                  <label htmlFor="location" className="form-label">Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={post.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Current Photo Display */}
                {post.photo && (
                  <div className="mb-3">
                    <label className="form-label">Current Photo</label>
                    <div>
                      <img
                        src={`http://localhost:8081/uploads/${post.photo}`}
                        alt="Current post"
                        style={{ maxWidth: "200px", height: "auto" }}
                        className="img-thumbnail"
                      />
                    </div>
                  </div>
                )}

                {/* New Photo Upload */}
                <div className="mb-3">
                  <label htmlFor="photo" className="form-label">
                    {post.photo ? "Change Photo (optional)" : "Upload Photo *"}
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="form-text">
                    {post.photo ? "Leave empty to keep current photo" : "Please upload a photo"}
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save"></i> Update Post
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>
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