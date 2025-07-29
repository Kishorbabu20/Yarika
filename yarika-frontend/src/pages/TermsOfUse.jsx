import React from "react";
import { Helmet } from "react-helmet";
import NavigationBarSection from "../user/NavigationBarSection";
import Footer from "../components/Footer";
import "../styles/global.css";

const TermsOfUse = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Use - Yarika</title>
        <meta name="description" content="Terms of Use for Yarika - Premium Ethnic Wear. Read our terms and conditions for using our services." />
      </Helmet>
      
      
      
      <div className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">Terms of Use</h1>
          <div className="policy-content">
            <p className="policy-date">Last updated: January 2025</p>
            
            <section className="policy-section">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using the Yarika website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section className="policy-section">
              <h2>2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on Yarika's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on Yarika's website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="policy-section">
              <h2>3. Product Information</h2>
              <p>We strive to display our products as accurately as possible. However, we do not guarantee that your computer monitor's display of any color will be accurate. We reserve the right to discontinue any product at any time.</p>
            </section>

            <section className="policy-section">
              <h2>4. Pricing and Payment</h2>
              <p>All prices are in Indian Rupees (INR) and are subject to change without notice. We reserve the right to modify or discontinue any product at any time. Payment must be made at the time of order placement.</p>
            </section>

            <section className="policy-section">
              <h2>5. Shipping and Delivery</h2>
              <p>Delivery times are estimates only. We are not responsible for delays beyond our control. Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier.</p>
            </section>

            <section className="policy-section">
              <h2>6. Returns and Refunds</h2>
              <p>Please refer to our return policy for information about returns and refunds. Custom-made items may have different return policies.</p>
            </section>

            <section className="policy-section">
              <h2>7. Privacy</h2>
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, to understand our practices.</p>
            </section>

            <section className="policy-section">
              <h2>8. Disclaimer</h2>
              <p>The materials on Yarika's website are provided on an 'as is' basis. Yarika makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </section>

            <section className="policy-section">
              <h2>9. Limitations</h2>
              <p>In no event shall Yarika or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Yarika's website.</p>
            </section>

            <section className="policy-section">
              <h2>10. Revisions and Errata</h2>
              <p>The materials appearing on Yarika's website could include technical, typographical, or photographic errors. Yarika does not warrant that any of the materials on its website are accurate, complete or current.</p>
            </section>

            <section className="policy-section">
              <h2>11. Links</h2>
              <p>Yarika has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Yarika of the site.</p>
            </section>

            <section className="policy-section">
              <h2>12. Modifications</h2>
              <p>Yarika may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms of Service.</p>
            </section>

            <section className="policy-section">
              <h2>13. Contact Information</h2>
              <p>If you have any questions about these Terms of Use, please contact us at:</p>
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

export default TermsOfUse; 