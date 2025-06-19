import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Posts.css";

function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8081/api/posts")
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  return (
    <div className="posts-container">
      {posts.map(post => (
        <div key={post.id} className="post-card">
          {post.photo && (
            <img
              src={`http://localhost:8081/uploads/${post.photo}`}
              alt="Post"
              className="post-image"
            />
          )}
          <div className="post-card-content">
            <h3>{post.title}</h3>
            <p>Category: {post.category} | Condition: {post.conditions}</p>
            <p>Price: Rs. {post.price} ({post.negotiable ? "Negotiable" : "Fixed"})</p>
            <p>{post.description}</p>
            <p className="post-meta">
              Posted on {new Date(post.created_at).toLocaleString()} · 
              {post.location || "Unknown location"} · 
              Seller: {post.seller_name || "Unknown"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Posts;