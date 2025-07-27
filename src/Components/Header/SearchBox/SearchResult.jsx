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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);
      
      axios.get(`http://localhost:8081/api/search?q=${query}`)
        .then(res => {
          // Handle both array and { data: array } responses
          const data = Array.isArray(res.data) ? res.data : res.data?.data;
          
          if (!data) {
            throw new Error('Invalid response format');
          }
          
          setResults(data);
        })
        .catch(err => {
          console.error('Search failed:', err);
          setError(err.message || 'Failed to load search results');
          setResults([]);
        })
        .finally(() => setLoading(false));
    } else {
      setResults([]); // Clear results if query is empty
    }
  }, [query]);

  const handlePostClick = (id) => {
    window.open(`/post/${id}`, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <div className="search-results">
        <h2>Searching for "{query}"...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="search-results">
        <h2>Error searching for "{query}"</h2>
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  // Empty state
  if (results.length === 0 && query) {
    return (
      <div className="search-results">
        <h2>No results found for "{query}"</h2>
        <p>Try different keywords or check your spelling</p>
      </div>
    );
  }

  // Success state
  return (
    <div className="search-results">
      <h2>Search Results for "{query}"</h2>
      <div className="results-grid">
        {results.map(post => (
          <div
            key={post.id}
            className="result-card"
            onClick={() => handlePostClick(post.id)}
          >
            <img
              src={post.photo ? `http://localhost:8081/uploads/${post.photo}` : '/placeholder-image.jpg'}
              alt={post.title || 'Untitled post'}
              className="result-image"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
            <div className="result-details">
              <h3>{post.title || 'Untitled Post'}</h3>
              <p>Category: {post.category || 'N/A'} | Condition: {post.conditions || 'N/A'}</p>
              <p>Price: Rs. {post.price || '0'} ({post.negotiable ? "Negotiable" : "Fixed"})</p>
              <p>{post.location || 'Location not specified'}</p>
              <p className="posted-info">
                Posted on {post.created_at ? new Date(post.created_at).toLocaleString() : 'Unknown date'} • 
                Seller: {post.seller_name || 'Unknown seller'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}