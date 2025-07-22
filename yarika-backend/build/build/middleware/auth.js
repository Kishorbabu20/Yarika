const jwt = require("jsonwebtoken");
const Client = require("../models/Client");
const Admin = require("../models/Admin");

// Flexible protect middleware
const protect = (options = { model: "client" }) => {
    return async (req, res, next) => {
        try {
        let token;

            console.log('Auth middleware - Request info:', {
                path: req.path,
                method: req.method,
                model: options.model,
                authHeader: req.headers.authorization
            });

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
                console.log('Token extracted from header');
        }

        if (!token) {
                console.error('No token provided in request');
                return res.status(401).json({ 
                    success: false, 
                    error: "Not authorized",
                    details: "No authentication token provided"
                });
        }

        try {
                console.log('Verifying token for model:', options.model);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log('Token decoded successfully:', {
                    userId: decoded.id,
                    role: decoded.role
                });

            let user;
            if (options.model === "client") {
                user = await Client.findById(decoded.id);
                    console.log('Client lookup result:', user ? 'Found' : 'Not found');
                    
                    if (!user) {
                        console.error('Client not found for ID:', decoded.id);
                        return res.status(404).json({ 
                            success: false, 
                            error: "Client not found",
                            details: "The client associated with this token no longer exists"
                        });
                    }
                req.client = user;
            } else if (options.model === "admin") {
                    // For admin routes, verify the role claim in the token
                    const role = decoded.role.toLowerCase();
                    if (!role || !['admin', 'super admin'].includes(role)) {
                        console.error('Invalid role in admin token:', role);
                        return res.status(403).json({
                            success: false,
                            error: "Not authorized",
                            details: "Invalid admin credentials"
                        });
                    }

                user = await Admin.findById(decoded.id);
                    console.log('Admin lookup result:', user ? 'Found' : 'Not found');
                    
                    if (!user) {
                        console.error('Admin not found for ID:', decoded.id);
                        return res.status(404).json({ 
                            success: false, 
                            error: "Admin not found",
                            details: "The admin associated with this token no longer exists"
                        });
                    }

                    // Check if admin is still active
                    if (user.status !== 'Active') {
                        console.error('Admin account is not active:', decoded.id);
                        return res.status(403).json({
                            success: false,
                            error: "Account inactive",
                            details: "This admin account is no longer active"
                        });
                    }

                req.admin = user;
            } else {
                    console.log('Using decoded token as user');
                req.user = decoded; // fallback
            }

            next();
            } catch (jwtError) {
                console.error("JWT verification error:", {
                    name: jwtError.name,
                    message: jwtError.message,
                    expiredAt: jwtError.expiredAt,
                    stack: jwtError.stack
                });

                if (jwtError.name === 'TokenExpiredError') {
                    return res.status(401).json({ 
                        success: false, 
                        error: "Token expired",
                        details: "Please log in again"
                    });
                }

                if (jwtError.name === 'JsonWebTokenError') {
                    return res.status(401).json({ 
                        success: false, 
                        error: "Invalid token",
                        details: "Token validation failed"
                    });
                }

                res.status(401).json({ 
                    success: false, 
                    error: "Authentication failed",
                    details: jwtError.message
                });
            }
        } catch (err) {
            console.error("Auth middleware error:", {
                name: err.name,
                message: err.message,
                stack: err.stack
            });
            res.status(500).json({ 
                success: false, 
                error: "Authentication error",
                details: "An error occurred while processing authentication"
            });
        }
    };
};

module.exports = protect;
