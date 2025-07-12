import React from "react";
import YarikaLogo2 from "../assets/YarikaLogo2.png";
import MailIcon from "../assets/mail-gold.png";
import PhoneIcon from "../assets/phone-gold.png";
import WhatsappIcon from "../assets/whatsapp-gold.png";

const Footer = () => (
  <footer style={{
    background: "#181818",
    color: "#fff",
    padding: "0 0 24px 0",
    fontFamily: "Inter, Helvetica, Arial, sans-serif"
  }}>
    <div style={{ textAlign: "center", padding: "32px 0 24px 0" }}>
      <img src="/YarikaLogo2.png" alt="Yarika Logo" style={{ height: 70, margin: "0 auto" }} />
    </div>
    <div
      className="footer-flex"
    >
      {/* Left Columns */}
      <div style={{ display: "flex", flexDirection: window.innerWidth <= 768 ? "column" : "row", gap: window.innerWidth <= 768 ? 24 : 64, alignItems: window.innerWidth <= 768 ? "center" : undefined }}>
        {/* Quick Links */}
        <div>
          <h4 style={{
            color: "#c6aa62",
            letterSpacing: 2,
            fontWeight: 700,
            marginBottom: 16,
            fontSize: 15,
            textAlign: "left",
            textTransform: "uppercase"
          }}>Quick Links</h4>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontSize: 17,
            letterSpacing: 1,
            textAlign: "left",
            lineHeight: "2.2",
            fontWeight: 400
          }}>
            <li><a href="/trending" style={{ color: "#fff", textDecoration: "none" }}>Trending</a></li>
            <li><a href="/products" style={{ color: "#fff", textDecoration: "none" }}>Blouses</a></li>
            <li><a href="/leggings" style={{ color: "#fff", textDecoration: "none" }}>Leggings</a></li>
            <li><a href="/materials" style={{ color: "#fff", textDecoration: "none" }}>Materials</a></li>
          </ul>
        </div>
        {/* The Company */}
        <div>
          <h4 style={{
            color: "#c6aa62",
            letterSpacing: 2,
            fontWeight: 700,
            marginBottom: 16,
            fontSize: 15,
            textAlign: "left",
            textTransform: "uppercase"
          }}>The Company</h4>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontSize: 17,
            letterSpacing: 1,
            textAlign: "left",
            lineHeight: "2.2",
            fontWeight: 400
          }}>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none" }}>About</a></li>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none" }}>Terms Of Services</a></li>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none" }}>Privacy Policy</a></li>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none" }}>Refund Policy</a></li>
            <li><a href="#" style={{ color: "#fff", textDecoration: "none" }}>Shipping Policy</a></li>
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h4 style={{
            color: "#c6aa62",
            letterSpacing: 2,
            fontWeight: 700,
            marginBottom: 16,
            fontSize: 15,
            textAlign: "left",
            textTransform: "uppercase"
          }}>Contact</h4>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontSize: 17,
            letterSpacing: 1,
            textAlign: "left",
            lineHeight: "2.2",
            fontWeight: 400
          }}>
            <li style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <img src={MailIcon} alt="Mail" style={{ height: 20, width: 20, marginRight: 8 }} />
              <span>info@zillionthreads.com</span>
            </li>
            {/* <li>
              {/* <img src={PhoneIcon} alt="Phone" style={{ height: 20, width: 20, marginRight: 12, verticalAlign: "middle" }} />
              1800-123-4567
            </li> */}
            <li>
              <img src={WhatsappIcon} alt="WhatsApp" style={{ height: 20, width: 20, marginRight: 12, verticalAlign: "middle" }} />
              9489642229
            </li>
          </ul>
        </div>
      </div>
      {/* Right Card */}
      <div style={{
        background: "#fff",
        color: "#181818",
        borderRadius: 16,
        padding: window.innerWidth <= 480 ? "16px 8px" : window.innerWidth <= 768 ? "24px 12px" : "32px 24px",
        width: window.innerWidth <= 480 ? 180 : window.innerWidth <= 768 ? 200 : 220,
        height: window.innerWidth <= 480 ? 180 : window.innerWidth <= 768 ? 200 : 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        marginLeft: window.innerWidth <= 768 ? 0 : "auto",
        marginTop: window.innerWidth <= 768 ? 24 : 0,
        alignSelf: window.innerWidth <= 768 ? "center" : undefined
      }}>
        <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, lineHeight: 1.1 }}>
          We would love to<br />hear from you.
        </div>
        <div style={{ fontSize: 15, marginBottom: 32 }}>
          Feel free to reach out if you want to collaborate with us, or simply have a chat.
        </div>
        <button style={{
          background: "none",
          border: "none",
          color: "#181818",
          fontSize: 18,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          padding: 0
        }}>
          Become a client
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #181818",
            borderRadius: "50%",
            width: 36,
            height: 36,
            marginLeft: 8
          }}>
            <span style={{ fontSize: 20, marginLeft: 2 }}>→</span>
          </span>
        </button>
      </div>
    </div>
    <div style={{
      textAlign: "center",
      color: "#aaa",
      fontSize: 14,
      marginTop: 32,
      letterSpacing: 2,
      fontWeight: 400
    }}>
      © ALL RIGHTS RESERVED, ZILLION THREADS
    </div>
  </footer>
);

export default Footer; 