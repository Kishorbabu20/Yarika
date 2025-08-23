import React from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";
import shipwayLogo from "../assets/shipway-logo.png";
import razorpayLogo from "../assets/razorpay_logo.png";

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-col">
        <div className="footer-title">SHIPPING INFO</div>
        <div className="footer-links">
          <Link to="/payments" className="footer-link">Payments</Link>
          <Link to="/shipping-policy" className="footer-link">Shipping & Exchange</Link>
          <Link to="/bulk-queries" className="footer-link">Bulk Queries</Link>
          <Link to="/terms-of-use" className="footer-link">Terms & Conditions</Link>
          <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
        </div>
      </div>
      
      <div className="footer-col">
        <div className="footer-title">THE COMPANY</div>
        <div className="footer-links">
          <Link to="/about-us" className="footer-link">About Us</Link>
          <Link to="/contact-us" className="footer-link">Contact Us</Link>
          <a 
            href="https://www.google.com/maps/place/Zillion+Threads/@11.011062,76.8626941,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba85f912d3d1dd9:0xdfd0242d8a996267!8m2!3d11.011062!4d76.865269!16s%2Fg%2F11ybt6v8jq?entry=ttu"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Store Locator
          </a>
        </div>
      </div>
      
      <div className="footer-col">
        <div className="footer-title">MY ACCOUNT</div>
        <div className="footer-links">
          <Link to="/orders" className="footer-link">Track Order</Link>
        </div>
      </div>
      
      <div className="footer-col">
        <div className="footer-title">PAYMENT & SHIPPING PARTNER</div>
        <div className="footer-logos">
          <img src={shipwayLogo} alt="Shipway" className="footer-logo" />
          <img src={razorpayLogo} alt="Razorpay" className="footer-logo" />
        </div>
      </div>
    </div>
    
    <div className="footer-bottom">
      © 2025, Yarika. All Rights Reserved.
    </div>
  </footer>
);

export default Footer; 