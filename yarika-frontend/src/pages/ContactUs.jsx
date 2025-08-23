import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Footer from "../components/Footer";
import "../styles/global.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Contact form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Yarika</title>
        <meta name="description" content="Get in touch with Yarika. Contact us for customer support, bulk orders, or any inquiries about our ethnic wear collection." />
      </Helmet>
      
      <div className="page-container">
        <div className="page-header">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with us!</p>
        </div>
        
        <div className="page-content">
          <section className="contact-info-section">
            <h2>Get In Touch</h2>
            <div className="contact-info-grid">
              <div className="contact-info-item">
                <h3>Customer Support</h3>
                <div className="contact-details">
                  <p><strong>Phone:</strong> +91 94890 4226</p>
                  <p><strong>WhatsApp:</strong> +91 94890 4223</p>
                  <p><strong>Email:</strong> support@yarika.com</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <h3>Bulk Orders</h3>
                <div className="contact-details">
                  <p><strong>Phone:</strong> +91 94890 4226</p>
                  <p><strong>WhatsApp:</strong> +91 94890 4223</p>
                  <p><strong>Email:</strong> bulk@yarika.com</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <h3>Business Hours</h3>
                <div className="contact-details">
                  <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
                  <p><strong>Saturday:</strong> 9:00 AM - 4:00 PM</p>
                  <p><strong>Sunday:</strong> Closed</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <h3>Office Address</h3>
                <div className="contact-details">
                  <p>SF No. 29/18, Onapalayam,</p>
                  <p>Vadavalli To Thondamuthur Road,</p>
                  <p>Coimbatore-641 109, Tamilnadu, India</p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="contact-form-section">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="product">Product Information</option>
                    <option value="order">Order Status</option>
                    <option value="bulk">Bulk Order</option>
                    <option value="support">Customer Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Please describe your inquiry or message in detail..."
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          </section>
          
          <section className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>How can I track my order?</h3>
                <p>You can track your order by logging into your account and visiting the "My Orders" section, or contact our customer support team.</p>
              </div>
              
              <div className="faq-item">
                <h3>What is your return policy?</h3>
                <p>We offer a 7-day return policy for most products. Please check our shipping policy page for detailed information.</p>
              </div>
              
              <div className="faq-item">
                <h3>Do you ship internationally?</h3>
                <p>Currently, we ship within India. We're working on expanding our international shipping options.</p>
              </div>
              
              <div className="faq-item">
                <h3>How long does delivery take?</h3>
                <p>Standard delivery takes 3-5 business days. Express delivery is available for select locations.</p>
              </div>
              
              <div className="faq-item">
                <h3>Can I customize my order?</h3>
                <p>Yes, we offer customization options for bulk orders. Please contact our bulk sales team for more information.</p>
              </div>
              
              <div className="faq-item">
                <h3>What payment methods do you accept?</h3>
                <p>We accept all major credit/debit cards, UPI, net banking, and digital wallets. Check our payments page for details.</p>
              </div>
            </div>
          </section>
          
          <section className="social-section">
            <h2>Connect With Us</h2>
            <div className="social-links">
              <div className="social-item">
                <h3>Follow Us</h3>
                <p>Stay updated with our latest collections and offers</p>
                <div className="social-icons">
                  <a href="https://instagram.com/yarika" target="_blank" rel="noopener noreferrer" className="social-icon">
                    Instagram
                  </a>
                  <a href="https://facebook.com/yarika" target="_blank" rel="noopener noreferrer" className="social-icon">
                    Facebook
                  </a>
                  <a href="https://youtube.com/yarika" target="_blank" rel="noopener noreferrer" className="social-icon">
                    YouTube
                  </a>
                </div>
              </div>
              
              <div className="social-item">
                <h3>Newsletter</h3>
                <p>Subscribe to our newsletter for exclusive offers and updates</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Enter your email address" />
                  <button type="button" className="subscribe-btn">Subscribe</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ContactUs;
