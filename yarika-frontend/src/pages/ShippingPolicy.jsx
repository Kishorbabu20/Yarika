import React from "react";
import { Helmet } from "react-helmet";
import NavigationBarSection from "../user/NavigationBarSection";
import Footer from "../components/Footer";
import "../styles/global.css";

const ShippingPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Shipping Policy - Yarika</title>
        <meta name="description" content="Shipping Policy for Yarika - Premium Ethnic Wear. Learn about our shipping methods, delivery times, and shipping costs." />
      </Helmet>
      
      
      <div className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">Shipping Policy</h1>
          <div className="policy-content">
            <p className="policy-date">Last updated: January 2025</p>
            
            <section className="policy-section">
              <h2>1. Shipping Methods</h2>
              <p>We offer the following shipping methods for your convenience:</p>
              <ul>
                <li><strong>Standard Delivery:</strong> 5-7 business days</li>
                <li><strong>Express Delivery:</strong> 2-3 business days</li>
                <li><strong>Same Day Delivery:</strong> Available for select locations (additional charges apply)</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>2. Shipping Costs</h2>
              <p>Shipping costs are calculated based on your location and the shipping method selected:</p>
              <ul>
                <li><strong>Free Shipping:</strong> Orders above ₹999</li>
                <li><strong>Standard Delivery:</strong> ₹99 for orders below ₹999</li>
                <li><strong>Express Delivery:</strong> ₹199</li>
                <li><strong>Same Day Delivery:</strong> ₹299 (where available)</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>3. Processing Time</h2>
              <p>Orders are typically processed within 1-2 business days. Custom-made items may require additional processing time. You will receive an email confirmation once your order is shipped.</p>
            </section>

            <section className="policy-section">
              <h2>4. Delivery Areas</h2>
              <p>We currently ship to all major cities and towns across India. Delivery to remote areas may take additional time. International shipping is not available at this time.</p>
            </section>

            <section className="policy-section">
              <h2>5. Order Tracking</h2>
              <p>Once your order is shipped, you will receive a tracking number via email. You can track your order status on our website or through the shipping partner's website.</p>
            </section>

            <section className="policy-section">
              <h2>6. Delivery Attempts</h2>
              <p>Our delivery partners will make up to 3 attempts to deliver your package. If delivery is unsuccessful after 3 attempts, the package will be returned to our facility.</p>
            </section>

            <section className="policy-section">
              <h2>7. Delivery Instructions</h2>
              <p>Please ensure someone is available at the delivery address during business hours. You may also provide specific delivery instructions in the order notes.</p>
            </section>

            <section className="policy-section">
              <h2>8. Package Protection</h2>
              <p>All packages are carefully packed to ensure your items arrive in perfect condition. We use high-quality packaging materials to protect your purchases during transit.</p>
            </section>

            <section className="policy-section">
              <h2>9. Delivery Delays</h2>
              <p>While we strive to deliver within the estimated timeframes, delays may occur due to:</p>
              <ul>
                <li>Weather conditions</li>
                <li>Holidays and festivals</li>
                <li>Customs clearance (if applicable)</li>
                <li>Unforeseen circumstances</li>
              </ul>
              <p>We will notify you of any significant delays and provide updated delivery information.</p>
            </section>

            <section className="policy-section">
              <h2>10. Failed Deliveries</h2>
              <p>If delivery fails due to incorrect address, recipient not available, or other reasons:</p>
              <ul>
                <li>The package will be returned to our facility</li>
                <li>We will contact you to arrange re-delivery</li>
                <li>Additional shipping charges may apply for re-delivery</li>
                <li>If re-delivery is not arranged within 7 days, a refund will be processed (minus shipping costs)</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>11. Damaged or Lost Packages</h2>
              <p>In the rare event that your package is damaged or lost during transit:</p>
              <ul>
                <li>Please contact us immediately</li>
                <li>Do not accept damaged packages</li>
                <li>We will arrange for a replacement or refund</li>
                <li>We will file a claim with the shipping partner</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>12. Shipping Partners</h2>
              <p>We partner with reliable shipping companies including:</p>
              <ul>
                <li>Shipway</li>
                <li>Other trusted logistics partners</li>
              </ul>
              <p>These partners are selected for their reliability and customer service.</p>
            </section>

            <section className="policy-section">
              <h2>13. Contact Information</h2>
              <p>If you have any questions about our shipping policy, please contact us at:</p>
              <div className="contact-info">
                <p>Email: info@zillionthreads.com</p>
                <p>Phone: +91 94890 4226, +91 94890 4223</p>
                <p>Address: SF No. 29/18, Onapalayam, Vadavalli To Thondamuthur Road, Coimbatore-641 109, Tamilnadu, India.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ShippingPolicy; 