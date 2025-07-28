import React from 'react';
import { Helmet } from 'react-helmet';
import NavigationBarSection from '../user/NavigationBarSection';
import Footer from '../components/Footer';

const ContactUs = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - Yarika Ethnic Wear</title>
        <meta name="description" content="Get in touch with Yarika for any queries about our ethnic wear collection, orders, or customer support. We're here to help you with premium quality ethnic clothing." />
        <meta name="keywords" content="contact yarika, customer support, ethnic wear help, yarika contact, customer service" />
        <meta property="og:title" content="Contact Us - Yarika Ethnic Wear" />
        <meta property="og:description" content="Get in touch with Yarika for any queries about our ethnic wear collection, orders, or customer support." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <NavigationBarSection />
      
      <div className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">Contact Us</h1>
          <p className="policy-date">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="policy-content">
            <div className="policy-section">
              <h2>Get in Touch</h2>
              <p>We're here to help! If you have any questions about our products, orders, or need assistance with anything else, please don't hesitate to reach out to us.</p>
            </div>

            <div className="policy-section">
              <h2>Customer Support</h2>
              <p>Our dedicated customer support team is available to assist you with:</p>
              <ul>
                <li>Product inquiries and recommendations</li>
                <li>Order tracking and status updates</li>
                <li>Size and fit guidance</li>
                <li>Returns and exchanges</li>
                <li>Payment and billing questions</li>
                <li>General customer service</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>Contact Information</h2>
              <div className="contact-info">
                <p><strong>Email:</strong> info@zillionthreads.com</p>
                <p><strong>Phone:</strong> +91 98765 43210</p>
                <p><strong>WhatsApp:</strong> +91 98765 43210</p>
                <p><strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST</p>
              </div>
            </div>

            <div className="policy-section">
              <h2>Address</h2>
              <p><strong>Yarika Ethnic Wear</strong><br />
              SF No. 29/18, Onapalayam,<br />
              Vadavalli To Thondamuthur Road,<br /> 
              Coimbatore-641 109, Tamilnadu, India.</p>
            </div>

            <div className="policy-section">
              <h2>Response Time</h2>
              <p>We strive to respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly or reach out via WhatsApp.</p>
            </div>

            <div className="policy-section">
              <h2>Social Media</h2>
              <p>Follow us on social media for the latest updates, new collections, and exclusive offers:</p>
              <ul>
                <li><strong>Instagram:</strong> @yarika_ethnic</li>
                {/* <li><strong>Facebook:</strong> @yarikaethnicwear</li>
                <li><strong>Twitter:</strong> @yarika_ethnic</li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ContactUs; 