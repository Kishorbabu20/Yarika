import React from "react";
import { Helmet } from "react-helmet";
import Footer from "../components/Footer";
import "../styles/global.css";

const Payments = () => {
  return (
    <>
      <Helmet>
        <title>Payments - Yarika</title>
        <meta name="description" content="Secure payment options at Yarika. Learn about our payment methods, security, and policies." />
      </Helmet>
      
      <div className="page-container">
        <div className="page-header">
          <h1>Payment Methods</h1>
          <p>Secure and convenient payment options for your shopping</p>
        </div>
        
        <div className="page-content">
          <section className="payment-section">
            <h2>Accepted Payment Methods</h2>
            <div className="payment-methods">
              <div className="payment-method">
                <h3>Credit/Debit Cards</h3>
                <p>We accept all major credit and debit cards including Visa, MasterCard, American Express, and RuPay.</p>
                <ul>
                  <li>Secure SSL encryption</li>
                  <li>Instant payment processing</li>
                  <li>Wide acceptance</li>
                </ul>
              </div>
              
              <div className="payment-method">
                <h3>UPI Payments</h3>
                <p>Pay using any UPI app including Google Pay, PhonePe, Paytm, and BHIM.</p>
                <ul>
                  <li>Quick and easy</li>
                  <li>No additional charges</li>
                  <li>Instant confirmation</li>
                </ul>
              </div>
              
              <div className="payment-method">
                <h3>Net Banking</h3>
                <p>Pay directly from your bank account using net banking services.</p>
                <ul>
                  <li>Direct bank transfer</li>
                  <li>Secure authentication</li>
                  <li>Real-time processing</li>
                </ul>
              </div>
              
              <div className="payment-method">
                <h3>Digital Wallets</h3>
                <p>Use popular digital wallets for quick and secure payments.</p>
                <ul>
                  <li>Paytm, PhonePe, Google Pay</li>
                  <li>Amazon Pay, Flipkart Pay</li>
                  <li>Convenient and fast</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section className="payment-section">
            <h2>Payment Security</h2>
            <div className="security-features">
              <div className="security-item">
                <h3>SSL Encryption</h3>
                <p>All payment transactions are secured with 256-bit SSL encryption to protect your sensitive information.</p>
              </div>
              
              <div className="security-item">
                <h3>PCI DSS Compliant</h3>
                <p>Our payment processing follows PCI DSS standards to ensure the highest level of security.</p>
              </div>
              
              <div className="security-item">
                <h3>Secure Gateway</h3>
                <p>We use trusted payment gateways that are certified and regularly audited for security.</p>
              </div>
            </div>
          </section>
          
          <section className="payment-section">
            <h2>Payment Policies</h2>
            <div className="policy-info">
              <div className="policy-item">
                <h3>Payment Confirmation</h3>
                <p>You will receive an immediate confirmation email once your payment is processed successfully.</p>
              </div>
              
              <div className="policy-item">
                <h3>Refund Policy</h3>
                <p>Refunds are processed within 5-7 business days and will be credited to your original payment method.</p>
              </div>
              
              <div className="policy-item">
                <h3>Failed Payments</h3>
                <p>If a payment fails, no amount will be deducted from your account. You can retry the payment.</p>
              </div>
            </div>
          </section>
          
          <section className="payment-section">
            <h2>Need Help?</h2>
            <div className="help-section">
              <p>If you encounter any issues with payments, please contact our customer support:</p>
              <div className="contact-info">
                <p><strong>Email:</strong> support@yarika.com</p>
                <p><strong>Phone:</strong> +91 94890 4226</p>
                <p><strong>WhatsApp:</strong> +91 94890 4223</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Payments;
