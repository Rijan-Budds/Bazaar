import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./PostDetail.css";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8081/api/posts/${id}`)
      .then(response => {
        setPost(response.data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching post:", error);
        setLoading(false);
      });

    axios.get(`http://localhost:8081/api/posts/${id}/comments`)
      .then(res => setComments(res.data.data))
      .catch(err => console.error("Error fetching comments:", err));

    axios.get('http://localhost:8081/api/auth/status', { withCredentials: true })
      .then(res => {
        if (res.data.authenticated) {
          setCurrentUser(res.data.user);
        }
      }).catch(err => console.error("Auth check failed", err));
  }, [id]);

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    axios.post(`http://localhost:8081/api/posts/${id}/comments`, {
      content: commentText
    }, { withCredentials: true })
    .then(() => {
      setCommentText("");
      return axios.get(`http://localhost:8081/api/posts/${id}/comments`);
    })
    .then(res => setComments(res.data.data))
    .catch(err => console.error("Error posting comment:", err));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!post) {
    return <div className="error">Post not found</div>;
  }

  return (
    <div className="post-detail-container">
      <div className="main-content">
        <div className="product-section">
          <div className="product-image">
            {post.photo && (
              <img
                src={`http://localhost:8081/uploads/${post.photo}`}
                alt={post.title}
                className="main-image"
              />
            )}
          </div>

          <div className="product-info">
            <h1 className="product-title">{post.title}</h1>
            <div className="price-section">
              <span className="price">Rs. {post.price}</span>
            </div>

            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                Comments
              </button>
              <button 
                className={`tab ${activeTab === 'location' ? 'active' : ''}`}
                onClick={() => setActiveTab('location')}
              >
                Location
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="description-content">
                  <div className="description-text">
                    <p>{post.description}</p>
                  </div>

                  <div className="general-section">
                    <h3>General</h3>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="label">AD ID</span>
                        <span className="value">{post.id}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Location</span>
                        <span className="value">{post.location || 'Not specified'}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Delivery</span>
                        <span className="value">Not Available</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Negotiable</span>
                        <span className="value">{post.negotiable ? 'Negotiable' : 'Fixed'}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Ads Posted</span>
                        <span className="value">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Category</span>
                        <span className="value">{post.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="comments-content">
                  {currentUser ? (
                    <div className="comment-form">
                      <textarea
                        placeholder="Write your comment here..."
                        rows="4"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                      />
                      <button className="submit-comment" onClick={handleCommentSubmit}>
                        Post Comment
                      </button>
                    </div>
                  ) : (
                    <p>Please log in to post a comment.</p>
                  )}

                  <div className="comment-list">
                    {comments.length === 0 ? (
                      <p>No comments yet. Be the first to comment!</p>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                          <strong>{comment.username}</strong>
                          <p>{comment.content}</p>
                          <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div className="location-content">
                  <div className="location-info">
                    <h4>📍 {post.location || 'Location not specified'}</h4>
                    <p>Contact the seller for exact location details.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="seller-section">
          <div className="seller-profile">
            <div className="seller-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <div className="seller-info">
              <h3 className="seller-name">{post.seller_name || 'Unknown Seller'}</h3>
              <p className="seller-id">User-ID: {post.user_id}</p>
            </div>
          </div>

          <div className="safety-note">
            <p><strong>Note:</strong> We recommend you to physically inspect the product/Service before making payment. Avoid paying fees or advance payment to sellers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}