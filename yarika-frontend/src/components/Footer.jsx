import React from "react";
import { Link } from "react-router-dom";
import "../styles/global.css"; // Create or update this CSS file
import shipwayLogo from "../assets/shipway-logo.png"; // Place your logo in assets
import razorpayLogo from "../assets/razorpay-logo.png"; // Place your logo in assets
import instagramIcon from "../assets/instagram.png"; // Place your icon in assets

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-col">
        <div className="footer-title">ADDRESS</div>
        <a
          href="https://www.google.com/maps/place/Zillion+Threads/@11.011062,76.8626941,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba85f912d3d1dd9:0xdfd0242d8a996267!8m2!3d11.011062!4d76.865269!16s%2Fg%2F11ybt6v8jq?entry=ttu&g_ep=EgoyMDI1MDcyMi4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#fff", textDecoration: "none" }}
        >
          SF No. 29/18, Onapalayam,<br />
          Vadavalli To Thondamuthur Road,<br />
          Coimbatore-641 109, Tamilnadu, India.
        </a>
    </div>
      <div className="footer-col">
        <div className="footer-title">CONTACT</div>
        <div>
          +91 94890 4226<br />
          +91 94890 4223<br />
          info@zillionthreads.com
        </div>
        </div>
      <div className="footer-col">
        <div className="footer-title">POLICIES</div>
        <div>
          <Link to="/terms-of-use" style={{ color: "#fff", textDecoration: "none" }}>Terms Of Use</Link><br />
          <Link to="/privacy-policy" style={{ color: "#fff", textDecoration: "none" }}>Privacy Policy</Link><br />
          <Link to="/shipping-policy" style={{ color: "#fff", textDecoration: "none" }}>Shipping Policy</Link><br />
          <Link to="/cancellation-refund-policy" style={{ color: "#fff", textDecoration: "none" }}>Cancellation & Refund Policy</Link><br />
          <Link to="/contact-us" style={{ color: "#fff", textDecoration: "none" }}>Contact Us</Link><br />
          <Link to="/about-us" style={{ color: "#fff", textDecoration: "none" }}>About Us</Link>
        </div>
      </div>
      <div className="footer-col">
        <div className="footer-title">PAYMENT & SHIPPING PARTNER</div>
        <div className="footer-logos">
          <div className="footer-logo-bg">
          <img src={razorpayLogo} alt="Razorpay" className="footer-logo" />
          </div>
          <div className="footer-logo-bg">
          <img src={shipwayLogo} alt="Shipway" className="footer-logo" />
          </div>
        </div>
        {/* <div className="footer-title" style={{ marginTop: "1.5rem" }}>SOCIAL LINKS</div>
        <div>
          <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
            <img src={instagramIcon} alt="Instagram" className="footer-social" />
          </a>
        </div> */}
      </div>
    </div>
    <hr className="footer-divider" />
    <div className="footer-bottom">
      Copyrights © 2025 Yarika by Zillion Threads<br />
      All Rights Reserved.
    </div>
  </footer>
);

export default Footer; 