const express = require("express");
const router = express.Router();

// Redirect all auth requests to admin routes
router.post("/login", (req, res) => {
  res.redirect(307, "/api/admins/login");
});

router.post("/change-password", (req, res) => {
  res.redirect(307, "/api/admins/change-password");
});

module.exports = router;
