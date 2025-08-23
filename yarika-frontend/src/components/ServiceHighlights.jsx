import React from 'react';
import '../styles/ServiceHighlights.css';

const ServiceHighlights = () => {
  return (
    <section className="service-highlights-section">
      <div className="service-highlights-container">
        <div className="service-highlight-column">
          <h3 className="service-highlight-title">90% Ready To Ship</h3>
          <p className="service-highlight-text">
            We Impart Assurance On Worldwide Delivery And 90% Of The Merchandise Are Ready To Ship. Once The Order Placed From Your End, The Product Ordered Will Be Delivered To Your Doorstep Within 3-4 Business Days.
          </p>
        </div>
        <div className="service-highlight-column">
          <h3 className="service-highlight-title">100% Original Quality</h3>
          <p className="service-highlight-text">
            Quality Assurance Of Our Product Are Highly Uncompromisable As We Offer 100% Genuine Quality, Ensuring Our Products And Services To Meet Upto Your Expectation.
          </p>
        </div>
        <div className="service-highlight-column">
          <h3 className="service-highlight-title">Best Price Challenge</h3>
          <p className="service-highlight-text">
            The Prices Offered Here Are In Complete Gratification With The Customer As It Is Cost Effective And Best Suitable With Your Purchase To Make Your Shopping Experience Hassle Free And Easy Right From The Comfort Of Your Couch.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlights; 