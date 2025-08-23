import React, { useState } from "react";
import { Helmet } from "react-helmet";
import "../styles/signup.css";
import { FcGoogle } from "react-icons/fc";
import { FaKey } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import heroImage from "../assets/signup.png";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import { toast } from "react-hot-toast";

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
      console.log('Attempting login with email:', formData.email);
      
      const res = await api.post("/client/login", formData);
      console.log('Login response:', res.data);

      const { token, client } = res.data;

      // Save token and user data to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(client));
      localStorage.setItem("userName", `${client.firstName} ${client.lastName}`);
      localStorage.setItem("userEmail", client.email);

      toast.success("Login successful!");
      
      // Dispatch custom event to notify App component about login
      window.dispatchEvent(new CustomEvent('userLoggedIn', { 
        detail: { user: client, token } 
      }));
      
      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error('Login error:', error);
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
    window.location.href = "https://yarika.in/api/auth/google";
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Login - Yarika | Premium Ethnic Wear</title>
        <meta name="description" content="Login to your Yarika account to access exclusive ethnic wear collections, track orders, and manage your profile." />
        <meta name="keywords" content="login, Yarika, ethnic wear, account, authentication" />
        <meta property="og:title" content="Login - Yarika | Premium Ethnic Wear" />
        <meta property="og:description" content="Login to your Yarika account to access exclusive ethnic wear collections, track orders, and manage your profile." />
        <meta property="og:type" content="website" />
      </Helmet>

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