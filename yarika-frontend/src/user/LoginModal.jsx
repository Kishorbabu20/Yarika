import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import api from "../config/axios";
import { toast } from "react-hot-toast"; // Fixed: using react-hot-toast
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
            console.log('Attempting login with email:', email);
            
            const res = await api.post("/client/login", {
                email,
                password,
            });

            console.log('Login response:', res.data);
            const { token, client } = res.data;

            // Save token and user data to localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(client));
            localStorage.setItem("userName", `${client.firstName} ${client.lastName}`);
            localStorage.setItem("userEmail", client.email);

            toast.success("Login successful!");
            onClose(); // Close modal
            
            // Dispatch custom event to notify App component about login
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { user: client, token } 
            }));
            
            // Check if user was trying to access a protected page
            const currentPath = window.location.pathname;
            
            // If user was on cart page, stay there (they probably want to checkout)
            if (currentPath === '/cart') {
                // Just reload to update the cart state
                window.location.reload();
            }
            // If user was on a product page, stay there (they probably want to buy)
            else if (currentPath.includes('/product/') || currentPath.includes('/leggings') || currentPath.includes('/blouses')) {
                // Just reload to update the page state
                window.location.reload();
            }
            // If user was on wishlist, stay there
            else if (currentPath === '/wishlist') {
                window.location.reload();
            }
            // If user was on orders page, stay there
            else if (currentPath === '/orders') {
                window.location.reload();
            }
            // If user was on profile page, stay there
            else if (currentPath === '/profile') {
                window.location.reload();
            }
            // If user was on home page, just update state without reload
            else if (currentPath === '/') {
                // No need to reload, just update state
                console.log('User logged in on home page, updating state...');
            }
            // Default: go to home page
            else {
                navigate("/");
            }
        } catch (err) {
            console.error('Login error:', err);
            const msg = err.response?.data?.error || "Login failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "https://yarika.in/api/auth/google";
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
