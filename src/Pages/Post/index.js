import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Set default axios config for credentials
axios.defaults.withCredentials = true;

const PostCreation = () => {
  const [step, setStep] = useState(1);
  const [post, setPost] = useState({
    title: "",
    photo: null,
    category: "",
    conditions: "",
    description: "",
    location: "",
    price: "",
    negotiable: false,
  });
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status with the backend
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/auth/status", {
          withCredentials: true
        });
        
        if (response.data.authenticated) {
          setIsAuthenticated(true);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!post.title.trim()) newErrors.title = "Title is required";
      if (!post.photo) newErrors.photo = "Photo is required";
    }

    if (currentStep === 2) {
      if (!post.category) newErrors.category = "Category is required";
      if (!post.conditions) newErrors.conditions = "Condition is required";
      if (!post.description.trim())
        newErrors.description = "Description is required";
    }
    
    if (currentStep === 3) {
      if (!post.location.trim()) newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPost((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNumberInput = (e) => {
    // Allow only numbers, decimal point, and backspace/delete
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
    const isNumber = /[0-9]/.test(e.key);
    const isDecimal = e.key === '.' && !e.target.value.includes('.');
    
    if (!isNumber && !isDecimal && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPost((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      if (errors.photo) {
        setErrors((prev) => ({ ...prev, photo: "" }));
      }
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      const formData = new FormData();
      
      // Don't send user_id - backend gets it from session
      formData.append('title', post.title);
      formData.append('photo', post.photo);
      formData.append('category', post.category);
      formData.append('conditions', post.conditions);
      formData.append('description', post.description);
      formData.append('location', post.location);
      formData.append('price', post.price);
      formData.append('negotiable', post.negotiable ? 'true' : 'false');

      console.log('Submitting post...'); // Debug log

      try {
        const response = await axios.post("http://localhost:8081/api/posts", formData, {
          withCredentials: true, // Essential for session cookies
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Post created successfully:', response.data);
        navigate("/");
      } catch (error) {
        console.error("Error creating post:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          alert(`Error: ${error.response.data.message || 'Failed to create post'}`);
        } else {
          alert('Network error occurred');
        }
      }
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return post.title.trim() && post.photo;
    }
    if (step === 2) {
      return post.category && post.conditions && post.description.trim();
    }
    if (step === 3) {
      return post.location.trim();
    }
    return true;
  };

  // Don't render form until authentication is verified
  if (!isAuthenticated) {
    return <div>Checking authentication...</div>;
  }

  return (
    <div className="post-creation">
      <div className="progress-steps">Step {step} of 4</div>

      {step === 1 && (
        <div className="step">
          <h2>Title and Photo</h2>
          <input
            type="text"
            name="title"
            value={post.title}
            onChange={handleChange}
            placeholder="Title"
            required
            className={errors.title ? "error" : ""}
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}

          <input
            type="file"
            name="photo"
            onChange={handlePhotoChange}
            accept="image/*"
            required
            className={errors.photo ? "error" : ""}
          />
          {errors.photo && (
            <span className="error-message">{errors.photo}</span>
          )}

          {preview && (
            <img src={preview} alt="Preview" className="preview-image" />
          )}

          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={!isStepValid() ? "disabled" : ""}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="step">
          <h2>Details</h2>
          <select
            name="category"
            value={post.category}
            onChange={handleChange}
            required
            className={errors.category ? "error" : ""}
          >
            <option value="">Select Category</option>
            <option value="Apparels & Accessories">Apparels & Accessories</option>
            <option value="Automobiles">Automobiles</option>
            <option value="Beauty and health">Beauty and health</option>
            <option value="Books and learning">Books and learning</option>
            <option value="Business and industry">Business and industry</option>
            <option value="Computers and peripherals">Computers and peripherals</option>
            <option value="Electronics, TVs and more">Electronics, TVs and more</option>
            <option value="Events and Happenings">Events and Happenings</option>
            <option value="Jobs">Jobs</option>
            <option value="Music Instruments">Music Instruments</option>
            <option value="Mobile Phones and Accessories">Mobile Phones and Accessories</option>
            <option value="Pets for adoption">Pets for adoption</option>
            <option value="Toys and video games">Toys and video games</option>
            <option value="Travel, Tours and Packages">Travel, Tours and Packages</option>
            <option value="Services">Services</option>
            <option value="Furnishing and Appliances">Furnishing and Appliances</option>
            <option value="Fresh vegetables and meat">Fresh vegetables and meat</option>
            <option value="Want to buy">Want to buy</option>
          </select>
          {errors.category && (
            <span className="error-message">{errors.category}</span>
          )}

          <select
            name="conditions"
            value={post.conditions}
            onChange={handleChange}
            required
            className={errors.conditions ? "error" : ""}
          >
            <option value="">Select Condition</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
          {errors.conditions && (
            <span className="error-message">{errors.conditions}</span>
          )}

          <textarea
            name="description"
            value={post.description}
            onChange={handleChange}
            placeholder="Description"
            required
            className={errors.description ? "error" : ""}
          />
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}

          <div className="button-group">
            <button onClick={prevStep}>Back</button>
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={!isStepValid() ? "disabled" : ""}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step">
          <h2>Location</h2>
          <select
            name="location"
            value={post.location}
            onChange={handleChange}
            required
            className={errors.location ? "error" : ""}
          >
            <option value="">Select a location</option>
            <option value="Kathmandu">Kathmandu</option>
            <option value="Lalitpur">Lalitpur</option>
            <option value="Bhaktapur">Bhaktapur</option>
            <option value="Pokhara">Pokhara</option>
            <option value="Biratnagar">Biratnagar</option>
            <option value="Butwal">Butwal</option>
            <option value="Dharan">Dharan</option>
            <option value="Chitwan">Chitwan</option>
          </select>
          {errors.location && (
            <span className="error-message">{errors.location}</span>
          )}

          <div className="button-group">
            <button onClick={prevStep}>Back</button>
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={!isStepValid() ? "disabled" : ""}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="step">
          <h2>Pricing</h2>
          <input
            type="number"
            name="price"
            value={post.price}
            onChange={handleChange}
            onKeyDown={handleNumberInput}
            placeholder="Price"
            step="0.01"
            min="0"
            required
          />
          <label>
            <input
              type="checkbox"
              name="negotiable"
              checked={post.negotiable}
              onChange={handleChange}
            />
            Price is negotiable
          </label>
          <div className="button-group">
            <button onClick={prevStep}>Back</button>
            <button onClick={handleSubmit}>Submit Post</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCreation;