import React, { useState } from "react";
import "../styles/signup.css";
import { FcGoogle } from "react-icons/fc";
import { FaKey } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import heroImage from "../Img/signup.png";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/client/login", formData);

      const { token, client } = res.data;

      // Save token and user data to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(client));

      toast.success("Login successful!");
      
      // Navigate to home page and reload to update auth state
      navigate("/");
      window.location.reload();
    } catch (error) {
      const msg = error.response?.data?.error || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignup = () => {
    navigate("/signup");
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5001/api/auth/google";
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="brand">YARIKA</h1>
        <p className="tagline">EXPRESS YOURSELF</p>

        <form className="form-section" onSubmit={handleSubmit}>
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

          <button 
            type="submit" 
            className="btn black-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          <button
            type="button"
            className="btn google-btn"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={20} />
            Login with Google
          </button>

          <button type="button" className="btn switch-btn" onClick={handleGoToSignup}>
            Don't have an account? Sign up
          </button>
        </form>
      </div>

      <div className="auth-image" style={{ backgroundImage: `url(${heroImage})` }}></div>
    </div>
  );
} 