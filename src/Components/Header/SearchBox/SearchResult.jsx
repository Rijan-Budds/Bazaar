import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery().get('q');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      axios.get(`http://localhost:8081/api/search?q=${query}`)
        .then(res => setResults(res.data.data))
        .catch(err => console.error('Search failed', err));
    }
  }, [query]);

  const handlePostClick = (id) => {
    window.open(`/post/${id}`, '_blank');
  };

  return (
    <div className="search-results">
      <h2>Search Results for "{query}"</h2>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="results-grid">
          {results.map(post => (
            <div
              key={post.id}
              className="result-card"
              onClick={() => handlePostClick(post.id)}
            >
              <img
                src={`http://localhost:8081/uploads/${post.photo}`}
                alt={post.title}
                className="result-image"
              />
              <div className="result-details">
                <h3>{post.title}</h3>
                <p>Category: {post.category} | Condition: {post.conditions}</p>
                <p>Price: Rs. {post.price} ({post.negotiable ? "Negotiable" : "Fixed"})</p>
                <p>{post.location}</p>
                <p className="posted-info">
                  Posted on {new Date(post.created_at).toLocaleString()} • Seller: {post.seller_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}