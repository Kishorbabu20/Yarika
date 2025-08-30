import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Footer from "../components/Footer";
import "../styles/global.css";

const BulkQueries = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    quantity: "",
    productType: "",
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
    // console.log("Bulk query submitted:", formData);
    alert("Thank you for your bulk query! We'll get back to you soon.");
  };

  return (
    <>
      <Helmet>
        <title>Bulk Queries - Yarika</title>
        <meta name="description" content="Bulk orders and wholesale inquiries at Yarika. Get special pricing for large quantities." />
      </Helmet>
      
      <div className="page-container">
        <div className="page-header">
          <h1>Bulk Orders & Wholesale</h1>
          <p>Special pricing and dedicated support for bulk orders</p>
        </div>
        
        <div className="page-content">
          <section className="bulk-info-section">
            <h2>Why Choose Yarika for Bulk Orders?</h2>
            <div className="bulk-benefits">
              <div className="benefit-item">
                <h3>Competitive Pricing</h3>
                <p>Get special wholesale rates for bulk orders with quantity-based discounts.</p>
              </div>
              
              <div className="benefit-item">
                <h3>Quality Assurance</h3>
                <p>All bulk orders undergo strict quality checks to ensure consistency.</p>
              </div>
              
              <div className="benefit-item">
                <h3>Customization Options</h3>
                <p>Customize designs, colors, and sizes according to your requirements.</p>
              </div>
              
              <div className="benefit-item">
                <h3>Dedicated Support</h3>
                <p>Personal account manager for all your bulk order needs.</p>
              </div>
            </div>
          </section>
          
          <section className="bulk-categories-section">
            <h2>Available for Bulk Orders</h2>
            <div className="bulk-categories">
              <div className="category-item">
                <h3>Readymade Blouses</h3>
                <ul>
                  <li>Aari Blouse</li>
                  <li>Designer Blouse</li>
                  <li>Embroidery Blouse</li>
                  <li>Zardozi Blouse</li>
                  <li>Kalamkari Blouse</li>
                </ul>
              </div>
              
              <div className="category-item">
                <h3>Leggings</h3>
                <ul>
                  <li>Ankle Length Leggings</li>
                  <li>Churidar Leggings</li>
                  <li>Shimmer Leggings</li>
                  <li>Printed Leggings</li>
                </ul>
              </div>
              
              <div className="category-item">
                <h3>Materials</h3>
                <ul>
                  <li>Aari Cloth</li>
                  <li>Embroidery Cloth</li>
                  <li>Zardozi Cloth</li>
                  <li>Designer Fabric</li>
                </ul>
              </div>
              
              <div className="category-item">
                <h3>Bridal Collections</h3>
                <ul>
                  <li>Bridal Lehengas</li>
                  <li>Wedding Gowns</li>
                  <li>Bridal Blouses</li>
                  <li>Accessories</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section className="bulk-form-section">
            <h2>Submit Your Bulk Query</h2>
            <form onSubmit={handleSubmit} className="bulk-form">
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
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company">Company/Business Name</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Estimated Quantity *</label>
                  <select
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Quantity Range</option>
                    <option value="50-100">50-100 pieces</option>
                    <option value="100-500">100-500 pieces</option>
                    <option value="500-1000">500-1000 pieces</option>
                    <option value="1000+">1000+ pieces</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="productType">Product Type *</label>
                  <select
                    id="productType"
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Product Type</option>
                    <option value="blouses">Readymade Blouses</option>
                    <option value="leggings">Leggings</option>
                    <option value="materials">Materials</option>
                    <option value="bridal">Bridal Collections</option>
                    <option value="mixed">Mixed Products</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Additional Requirements</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Please describe your specific requirements, customization needs, delivery timeline, etc."
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                Submit Bulk Query
              </button>
            </form>
          </section>
          
          <section className="contact-section">
            <h2>Contact Our Bulk Sales Team</h2>
            <div className="contact-info">
              <div className="contact-item">
                <h3>Bulk Sales Manager</h3>
                <p><strong>Phone:</strong> +91 94890 4226</p>
                <p><strong>WhatsApp:</strong> +91 94890 4223</p>
                <p><strong>Email:</strong> bulk@yarika.com</p>
              </div>
              
              <div className="contact-item">
                <h3>Business Hours</h3>
                <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
                <p><strong>Saturday:</strong> 9:00 AM - 4:00 PM</p>
                <p><strong>Sunday:</strong> Closed</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default BulkQueries;
