import React, { useState } from "react";
import "../styles/signup.css";
import { FcGoogle } from "react-icons/fc";
import { FaUser, FaPhone, FaKey } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import heroImage from "../assets/signup.png";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import { toast } from "react-toastify";

export default function SignupLoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await api.post("/api/client/register", formData);
      toast.success("Registered successfully!");
      
      // Save token and user data to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.client));
      
      // Navigate to home page and reload to update auth state
      navigate("/");
      window.location.reload();
    } catch (error) {
      const msg = error.response?.data?.error || "Registration failed";
      toast.error(msg);
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="brand">YARIKA</h1>
        <p className="tagline">EXPRESS YOURSELF</p>

        <form className="form-section" onSubmit={handleSubmit}>
          <div className="row">
            <div className="input-group">
              <FaUser className="icon" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
            </div>
            <div className="input-group">
              <FaUser className="icon" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <MdEmail className="icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>

          <div className="input-group">
            <FaPhone className="icon" />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone No."
            />
          </div>

          <div className="input-group">
            <FaKey className="icon" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>

          <div className="input-group">
            <FaKey className="icon" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
          </div>

          <button type="submit" className="btn black-btn">
            Signup
          </button>

          <div className="divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          <button
            type="button"
            className="btn google-btn"
            onClick={() => window.location.href = "https://yarika.in/api/auth/google"}
          >
            <FcGoogle size={20} />
            Login with Google
          </button>

          <button type="button" className="btn switch-btn" onClick={handleGoToLogin}>
            Already have an account? Login
          </button>
        </form>
      </div>

      <div className="auth-image" style={{ backgroundImage: `url(${heroImage})` }}></div>
    </div>
  );
}
