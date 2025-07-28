import React from 'react';
import { Helmet } from 'react-helmet';
import NavigationBarSection from '../user/NavigationBarSection';
import Footer from '../components/Footer';
import YarikaLogo from '../assets/YarikaLogo1.png';

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Yarika Ethnic Wear</title>
        <meta name="description" content="Learn about Yarika's journey in crafting timeless ethnic wear. Discover our mission, values, and commitment to quality ethnic clothing for women." />
        <meta name="keywords" content="about yarika, ethnic wear company, yarika story, traditional clothing, indian ethnic wear" />
        <meta property="og:title" content="About Us - Yarika Ethnic Wear" />
        <meta property="og:description" content="Learn about Yarika's journey in crafting timeless ethnic wear for women." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <NavigationBarSection />
      
      <div className="policy-page">
        <div className="policy-container">
          <h1 className="policy-title">About Us</h1>
          <p className="policy-date">Established 2020</p>
          
          <div className="policy-content">
            <div className="policy-section">
              <h2>Our Story</h2>
              <p>Yarika was born from a deep passion for India's rich textile heritage and a vision to make authentic ethnic wear accessible to every woman. Founded in 2020, we started as a small family business with a big dream - to preserve traditional craftsmanship while embracing modern design sensibilities.</p>
              <p>What began as a humble collection of handcrafted blouses has grown into a comprehensive ethnic wear brand, offering everything from readymade blouses to custom ensembles that celebrate the diversity and beauty of Indian culture.</p>
            </div>

            <div className="policy-section">
              <h2>Our Mission</h2>
              <p>At Yarika, we are committed to:</p>
              <ul>
                <li><strong>Preserving Tradition:</strong> Keeping alive the centuries-old art of ethnic wear craftsmanship</li>
                <li><strong>Empowering Women:</strong> Helping every woman feel confident and beautiful in her ethnic attire</li>
                <li><strong>Quality First:</strong> Delivering premium quality products that stand the test of time</li>
                <li><strong>Innovation:</strong> Blending traditional techniques with contemporary designs</li>
                <li><strong>Sustainability:</strong> Supporting ethical practices and responsible fashion</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>Our Values</h2>
              <h3>Authenticity</h3>
              <p>We stay true to the essence of ethnic wear while adapting to modern lifestyles. Every piece tells a story of tradition and craftsmanship.</p>
              
              <h3>Quality</h3>
              <p>From fabric selection to final stitching, we maintain the highest standards of quality. Our products are made to last and designed to impress.</p>
              
              <h3>Customer First</h3>
              <p>Your satisfaction is our priority. We believe in building lasting relationships with our customers through exceptional service and support.</p>
              
              <h3>Innovation</h3>
              <p>We continuously evolve our designs and techniques to meet the changing needs of modern women while respecting traditional aesthetics.</p>
            </div>

            <div className="policy-section">
              <h2>Our Collections</h2>
              <p>Yarika offers a diverse range of ethnic wear including:</p>
              <ul>
                <li><strong>Readymade Blouses:</strong> Ready-to-wear blouses in various styles and sizes</li>
                <li><strong>Custom Blouses:</strong> Personalized blouses tailored to your measurements</li>
                <li><strong>Leggings:</strong> Comfortable and stylish ethnic leggings</li>
                <li><strong>Materials:</strong> High-quality fabrics for custom creations</li>
                <li><strong>Bridal Collection:</strong> Special occasion and wedding wear</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>Our Commitment</h2>
              <p>We are committed to:</p>
              <ul>
                <li>Using only the finest quality fabrics and materials</li>
                <li>Supporting local artisans and craftsmen</li>
                <li>Providing excellent customer service and support</li>
                <li>Maintaining ethical business practices</li>
                <li>Creating products that celebrate Indian culture</li>
                <li>Ensuring customer satisfaction with every purchase</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>Why Choose Yarika?</h2>
              <ul>
                <li><strong>Heritage:</strong> Deep-rooted understanding of ethnic wear traditions</li>
                <li><strong>Quality:</strong> Premium materials and expert craftsmanship</li>
                <li><strong>Variety:</strong> Extensive collection for every occasion</li>
                <li><strong>Customization:</strong> Personalized options for unique preferences</li>
                <li><strong>Service:</strong> Dedicated customer support team</li>
                <li><strong>Trust:</strong> Established reputation for reliability and quality</li>
              </ul>
            </div>

            <div className="policy-section">
              <h2>Contact Information</h2>
                <div className="contact-info">
                    <p><strong>Address:</strong>SF No. 29/18, Onapalayam,<br />
                    Vadavalli To Thondamuthur Road,<br />
                    Coimbatore-641 109, Tamilnadu, India.</p>
                <p><strong>Email:</strong> info@zillionthreads.com</p>
                <p><strong>Phone:</strong> +91 98765 43210</p>
                <p><strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default AboutUs; 