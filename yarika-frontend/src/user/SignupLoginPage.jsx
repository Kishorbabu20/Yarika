import React, { useState } from "react";
import "../styles/signup.css";
import { FcGoogle } from "react-icons/fc";
import { FaUser, FaPhone, FaKey } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import heroImage from "../assets/signup.png";
import logoImage from "../assets/YarikaLogo1.png";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import { toast } from "react-hot-toast";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      console.log('Attempting registration with:', { 
        firstName: formData.firstName, 
        lastName: formData.lastName, 
        email: formData.email,
        phoneNumber: formData.phoneNumber 
      });
      
      const res = await api.post("/client/register", formData);
      console.log('Registration response:', res.data);
      
      if (res.data.requiresVerification) {
        toast.success("Account created! Please verify your email.");
        setAwaitingVerification(true);
        setVerificationEmail(formData.email);
        setTempPassword(formData.password); // Store password for auto-login
      } else {
        toast.success("Registered and logged in successfully!");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.client));
        window.dispatchEvent(new CustomEvent('userLoggedIn', { 
          detail: { user: res.data.client, token: res.data.token } 
        }));
        navigate("/");
      }
    } catch (error) {
      console.error('Registration error:', error);
      const msg = error.response?.data?.error || "Registration failed";
      toast.error(msg);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }
    try {
      const res = await api.post("/client/verify-email", {
        email: verificationEmail,
        verificationCode
      });
      toast.success("Email verified! Logging you in...");
      // Auto-login after verification
      const loginRes = await api.post("/client/login", {
        email: verificationEmail,
        password: tempPassword
      });
      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("user", JSON.stringify(loginRes.data.client));
      window.dispatchEvent(new CustomEvent('userLoggedIn', { 
        detail: { user: loginRes.data.client, token: loginRes.data.token } 
      }));
      navigate("/");
    } catch (error) {
      const msg = error.response?.data?.error || "Verification or login failed";
      toast.error(msg);
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  if (awaitingVerification) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h1 className="brand">YARIKA</h1>
          <form className="form-section" onSubmit={handleVerify}>
            <div className="input-group">
              <MdEmail className="icon" />
              <input
                type="email"
                value={verificationEmail}
                disabled
                placeholder="Email"
              />
            </div>
            <div className="input-group">
              <FaKey className="icon" />
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="Verification Code"
                required
              />
            </div>
            <button type="submit" className="btn black-btn">
              Verify Email
            </button>
            <button type="button" className="btn switch-btn" onClick={handleGoToLogin}>
              Already verified? Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="form-left">
          <h1 className="brand">
            <img src={logoImage} alt="Yarika Logo" className="logo-image" />
          </h1>
          <p className="tagline">Welcome! Create your account below</p>
    
          {/* Header */}
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <div className="auth-subtext">
              Already have an account?{" "}
              <span className="auth-login-link" onClick={handleGoToLogin}>
                Login
              </span>
            </div>
          </div>
    
          <form className="form-section" onSubmit={handleSubmit}>
            {/* First + last name in two columns for desktop */}
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
    
            {/* Email */}
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
    
            {/* Phone */}
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
    
            {/* Password */}
            <div className="input-group">
              <FaKey className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              {showPassword ? (
                <AiOutlineEyeInvisible
                  onClick={() => setShowPassword(false)}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <AiOutlineEye
                  onClick={() => setShowPassword(true)}
                  style={{ cursor: "pointer" }}
                />
              )}
            </div>
    
            {/* Confirm Password */}
            <div className="input-group">
              <FaKey className="icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
              />
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible
                  onClick={() => setShowConfirmPassword(false)}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <AiOutlineEye
                  onClick={() => setShowPassword(true)}
                  style={{ cursor: "pointer" }}
                />
              )}
            </div>
    
            {/* Create button */}
            <button type="submit" className="btn btn-create">
              Create Account
            </button>
    
            <button
              type="button"
              className="return-link"
              onClick={() => (window.location.href = "/")}
            >
              Return To Store
            </button>
    
            <div className="divider">
              <span></span>
              <p>or</p>
              <span></span>
            </div>
    
            <button
              type="button"
              className="btn google-btn"
              onClick={() =>
                (window.location.href = "https://yarika.in/api/auth/google")
              }
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>
          </form>
        </div>
        
        <div className="form-right">
          <img src={heroImage} alt="Yarika Fashion" className="auth-image" />
        </div>
      </div>
    </div>
  );
}
