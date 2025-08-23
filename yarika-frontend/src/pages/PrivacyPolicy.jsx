import React from "react";
import { Helmet } from "react-helmet";
import NavigationBarSection from "../user/NavigationBarSection";
import Footer from "../components/Footer";
import "../styles/global.css";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Yarika</title>
        <meta name="description" content="Privacy Policy for Yarika - Premium Ethnic Wear. Learn how we collect, use, and protect your personal information." />
      </Helmet>
      
      
      <div className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">Privacy Policy</h1>
          <div className="policy-content">
            <p className="policy-date">Last updated: January 2025</p>
            
            <section className="policy-section">
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include:</p>
              <ul>
                <li>Name, email address, and phone number</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information</li>
                <li>Order history and preferences</li>
                <li>Communications with us</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Provide customer support</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>3. Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
              <ul>
                <li>With service providers who assist us in operating our website and processing payments</li>
                <li>With shipping partners to deliver your orders</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>4. Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand where our visitors are coming from. You can control cookie settings through your browser preferences.</p>
            </section>

            <section className="policy-section">
              <h2>5. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section className="policy-section">
              <h2>6. Data Retention</h2>
              <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law.</p>
            </section>

            <section className="policy-section">
              <h2>7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your personal information</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>8. Children's Privacy</h2>
              <p>Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</p>
            </section>

            <section className="policy-section">
              <h2>9. Third-Party Links</h2>
              <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to read their privacy policies.</p>
            </section>

            <section className="policy-section">
              <h2>10. International Transfers</h2>
              <p>Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws.</p>
            </section>

            <section className="policy-section">
              <h2>11. Changes to This Policy</h2>
              <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
            </section>

            <section className="policy-section">
              <h2>12. Contact Us</h2>
              <p>If you have any questions about this privacy policy, please contact us at:</p>
              <div className="contact-info">
                <p>Email: info@zillionthreads.com</p>
                <p>Phone: +91 94890 42226, +91 94890 42223</p>
                <p>Address: SF No. 29/1b, Onapalayam, Vadavalli To Thondamuthur Road, Coimbatore-641 109, Tamilnadu, India.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default PrivacyPolicy; 