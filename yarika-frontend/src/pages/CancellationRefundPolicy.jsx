import React from 'react';
import { Helmet } from 'react-helmet';
import NavigationBarSection from '../user/NavigationBarSection';
import Footer from '../components/Footer';

const CancellationRefundPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Cancellation & Refund Policy - Yarika Ethnic Wear</title>
        <meta name="description" content="Learn about Yarika's cancellation and refund policy. Understand our terms for order cancellation, returns, exchanges, and refunds for our ethnic wear collection." />
        <meta name="keywords" content="cancellation policy, refund policy, return policy, yarika returns, order cancellation" />
        <meta property="og:title" content="Cancellation & Refund Policy - Yarika Ethnic Wear" />
        <meta property="og:description" content="Learn about Yarika's cancellation and refund policy for our ethnic wear collection." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <NavigationBarSection />
      
      <div className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">Cancellation & Refund Policy</h1>
          <p className="policy-date">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="policy-content">
            <div className="policy-section">
              <h2>Order Cancellation</h2>
              <p>You can cancel your order within 2 hours of placing it. After this time, the order will be processed and shipped.</p>
              <ul>
                <li>Cancellation requests must be made via email or phone</li>
                <li>Provide your order number and reason for cancellation</li>
                <li>Refunds will be processed within 5-7 business days</li>
                <li>Custom or made-to-order items cannot be cancelled</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>Returns & Exchanges</h2>
              <p>We accept returns and exchanges within 7 days of delivery for the following reasons:</p>
              <ul>
                <li>Wrong size received</li>
                <li>Product defect or damage</li>
                <li>Item not as described</li>
                <li>Change of mind (subject to conditions)</li>
              </ul>
              
              <h3>Return Conditions:</h3>
              <ul>
                <li>Product must be unworn and unwashed</li>
                <li>Original tags and packaging must be intact</li>
                <li>No alterations or modifications made</li>
                <li>Sale items are final sale unless defective</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>Return Process</h2>
              <ol>
                <li>Contact our customer support within 7 days of delivery</li>
                <li>Provide order number and reason for return</li>
                <li>Receive return authorization and shipping label</li>
                <li>Package item securely with all original packaging</li>
                <li>Ship within 3 days of receiving authorization</li>
                <li>Refund or exchange processed upon receipt</li>
              </ol>
            </div>

            <div className="policy-section">
              <h2>Refund Policy</h2>
              <p>Refunds will be processed as follows:</p>
              <ul>
                <li><strong>Full Refund:</strong> For defective items or our errors</li>
                <li><strong>Partial Refund:</strong> For change of mind returns (shipping costs deducted)</li>
                <li><strong>Exchange:</strong> For size exchanges or similar items</li>
                <li><strong>Processing Time:</strong> 5-7 business days after receiving returned item</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>Shipping Costs</h2>
              <ul>
                <li>Free return shipping for defective items</li>
                <li>Customer pays return shipping for change of mind</li>
                <li>Exchange shipping is free for size exchanges</li>
                <li>International returns subject to additional charges</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>Non-Returnable Items</h2>
              <p>The following items cannot be returned:</p>
              <ul>
                <li>Custom or made-to-order items</li>
                <li>Sale or clearance items (unless defective)</li>
                <li>Items marked as "Final Sale"</li>
                <li>Personalized or monogrammed items</li>
                <li>Items with removed tags or packaging</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>Contact Information</h2>
              <div className="contact-info">
                <p>For cancellation, returns, or refund inquiries:</p>
                <p><strong>Email:</strong> info@zillionthreads.com</p>
                <p><strong>Phone:</strong> +91 98765 43210</p>
                <p><strong>WhatsApp:</strong> +91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default CancellationRefundPolicy; 