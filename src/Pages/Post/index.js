import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    user_id: "" 
  });
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userData = JSON.parse(localStorage.getItem("userData"));
    
    if (!isLoggedIn) {
      navigate("/login");
    } else if (userData) {
      setPost(prev => ({ ...prev, user_id: userData.id }));
    }
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
      
      Object.keys(post).forEach((key) => {
        if (key === "negotiable") {
          formData.append(key, post[key] ? "1" : "0");
        } else {
          formData.append(key, post[key]);
        }
      });

      try {
        const response = await fetch("http://localhost:8081/api/posts", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        
        if (response.ok) {
          navigate("/");
        } else {
          const errorData = await response.json();
          console.error("Error creating post:", errorData.message);
        }
      } catch (error) {
        console.error("Network error:", error);
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
    return true;
  };

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
            <option value="electronics">Apparels & Accessories</option>
            <option value="furniture">Automobiles</option>
            <option value="clothing">Beauty and health</option>
            <option value="clothing">Books and learning</option>
            <option value="clothing">Business and industry</option>
            <option value="clothing">Computers and peripherals</option>
            <option value="clothing">Electronics, TVs and more</option>
            <option value="clothing">Events and Happenings</option>
            <option value="clothing">Jobs</option>
            <option value="clothing">Music Instruments</option>
            <option value="clothing">Mobile Phones and Accessories</option>
            <option value="clothing">Pets for adoption</option>
            <option value="clothing">Toys and video games</option>
            <option value="clothing">Travel, Tours and Packages</option>
            <option value="clothing">Services</option>
            <option value="clothing">Furnishing and Appliances</option>
            <option value="clothing">Fresh vegetables and meat</option>
            <option value="clothing">Want to buy</option>
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
          <h2>Location </h2>
          <input
            type="text"
            name="location"
            value={post.location}
            onChange={handleChange}
            placeholder="Location"
            required
            className={errors.location ? "error" : ""}
          />
          {errors.location && (
            <span className="error-message">{errors.location}</span>
          )}

          <div className="button-group">
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep}>Next</button>
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
            placeholder="Price"
            step="0.01"
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