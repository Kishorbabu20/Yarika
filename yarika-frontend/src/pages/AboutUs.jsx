import React from "react";
import { Helmet } from "react-helmet";
import Footer from "../components/Footer";
import "../styles/global.css";

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Yarika</title>
        <meta name="description" content="Learn about Yarika's journey, mission, and commitment to crafting timeless ethnic wear with authentic Indian craftsmanship." />
      </Helmet>
      
      <div className="page-container">
        <div className="page-header">
          <h1>About Yarika</h1>
          <p>Crafting Timeless Elegance with Authentic Indian Heritage</p>
        </div>
        
        <div className="page-content">
          <section className="about-hero-section">
            <div className="about-hero-content">
              <h2>Our Story</h2>
              <p>
                At Yarika, we believe that true elegance is a blend of artistry, authenticity, and individuality. 
                Born from a deep appreciation for India's rich textile heritage, our brand is dedicated to creating 
                exquisite readymade and custom blouses that transcend fleeting trends.
              </p>
              <p>
                Each piece is a testament to meticulous craftsmanship, brought to life by skilled artisans who 
                pour their passion into every stitch and detail. We take pride in preserving traditional 
                techniques while embracing modern design sensibilities.
              </p>
            </div>
          </section>
          
          <section className="mission-section">
            <h2>Our Mission</h2>
            <div className="mission-content">
              <div className="mission-item">
                <h3>Preserve Heritage</h3>
                <p>To preserve and promote India's rich textile heritage through contemporary designs that honor traditional craftsmanship.</p>
              </div>
              
              <div className="mission-item">
                <h3>Empower Artisans</h3>
                <p>To support and empower skilled artisans by providing them with fair opportunities and preserving their traditional skills.</p>
              </div>
              
              <div className="mission-item">
                <h3>Deliver Quality</h3>
                <p>To deliver exceptional quality products that exceed customer expectations while maintaining ethical business practices.</p>
              </div>
            </div>
          </section>
          
          <section className="values-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <h3>Authenticity</h3>
                <p>We stay true to our roots, using authentic materials and traditional techniques that have been passed down through generations.</p>
              </div>
              
              <div className="value-item">
                <h3>Quality</h3>
                <p>Every product undergoes rigorous quality checks to ensure it meets our high standards of excellence.</p>
              </div>
              
              <div className="value-item">
                <h3>Innovation</h3>
                <p>We blend traditional craftsmanship with modern design to create unique pieces that appeal to contemporary tastes.</p>
              </div>
              
              <div className="value-item">
                <h3>Sustainability</h3>
                <p>We are committed to sustainable practices, from sourcing eco-friendly materials to reducing our environmental footprint.</p>
              </div>
              
              <div className="value-item">
                <h3>Customer Focus</h3>
                <p>Our customers are at the heart of everything we do, and we strive to provide exceptional service and products.</p>
              </div>
              
              <div className="value-item">
                <h3>Community</h3>
                <p>We believe in giving back to the community and supporting local artisans and craftsmen.</p>
              </div>
            </div>
          </section>
          
          <section className="craftsmanship-section">
            <h2>Our Craftsmanship</h2>
            <div className="craftsmanship-content">
              <div className="craft-item">
                <h3>Traditional Techniques</h3>
                <p>We employ age-old techniques like Aari work, Zardozi embroidery, Kalamkari printing, and hand-stitched details that have been perfected over centuries.</p>
              </div>
              
              <div className="craft-item">
                <h3>Skilled Artisans</h3>
                <p>Our team of skilled artisans brings decades of experience and passion to every piece, ensuring the highest quality of workmanship.</p>
              </div>
              
              <div className="craft-item">
                <h3>Quality Materials</h3>
                <p>We source the finest fabrics and materials, carefully selecting each element to ensure durability, comfort, and beauty.</p>
              </div>
            </div>
          </section>
          
          <section className="journey-section">
            <h2>Our Journey</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-year">2020</div>
                <div className="timeline-content">
                  <h3>Foundation</h3>
                  <p>Yarika was founded with a vision to bring authentic Indian ethnic wear to customers worldwide.</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-year">2021</div>
                <div className="timeline-content">
                  <h3>Expansion</h3>
                  <p>Launched our online platform and expanded our product range to include leggings and materials.</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-year">2022</div>
                <div className="timeline-content">
                  <h3>Bridal Collection</h3>
                  <p>Introduced our exclusive bridal collection featuring lehengas and wedding gowns.</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-year">2023</div>
                <div className="timeline-content">
                  <h3>Recognition</h3>
                  <p>Received recognition for our commitment to quality and traditional craftsmanship.</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-year">2024</div>
                <div className="timeline-content">
                  <h3>Growth</h3>
                  <p>Continued growth with enhanced customer service and expanded product offerings.</p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="team-section">
            <h2>Our Team</h2>
            <div className="team-content">
              <p>
                Our team consists of passionate individuals dedicated to bringing you the finest ethnic wear. 
                From our skilled artisans to our customer service representatives, every member of the Yarika 
                family is committed to excellence and customer satisfaction.
              </p>
              <div className="team-stats">
                <div className="stat-item">
                  <h3>50+</h3>
                  <p>Skilled Artisans</p>
                </div>
                <div className="stat-item">
                  <h3>1000+</h3>
                  <p>Happy Customers</p>
                </div>
                <div className="stat-item">
                  <h3>500+</h3>
                  <p>Unique Designs</p>
                </div>
                <div className="stat-item">
                  <h3>4+</h3>
                  <p>Years of Excellence</p>
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

export default AboutUs;
