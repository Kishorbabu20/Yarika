import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import api from "../config/axios";
import { toast } from "react-toastify"; // Assuming react-toastify is installed
import { FcGoogle } from "react-icons/fc"; // Import Google icon

export default function LoginModal({ onClose }) {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignupClick = () => {
        onClose(); // Close the login modal
        navigate("/signup"); // Navigate to signup page
    };

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/api/client/login", {
                email,
                password,
            });

            const { token, client } = res.data;

            // Save token and user data to localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(client));

            toast.success("Login successful!");
            onClose(); // Close modal
            
            // Navigate to home page and reload to ensure all components pick up the new auth state
            navigate("/");
            window.location.reload();
        } catch (err) {
            const msg = err.response?.data?.error || "Login failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:5001/api/auth/google";
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Login</h2>

                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="login-btn gold-btn"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <div className="divider">or</div>

                <button className="google-btn" onClick={handleGoogleLogin}>
                    <FcGoogle size={20} />
                    Continue with Google
                </button>

                <p className="signup-link">
                    Don't have an account?{" "}
                    <span onClick={handleSignupClick} className="link">Sign up</span>
                </p>
            </div>
        </div>
    );
}
