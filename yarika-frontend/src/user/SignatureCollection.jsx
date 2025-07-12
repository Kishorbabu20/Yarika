import React from 'react';
import SignatureBlouse1 from '../assets/SignatureBlouse1.png';
import SignatureBlouse2 from '../assets/SignatureBlouse2.png';
import SignatureBlouse3 from '../assets/SignatureBlouse3.png';

const SignatureCollection = () => {
  const signatureBlouses = [
    {
      id: 1,
      image: SignatureBlouse1,
      alt: "Orange & Teal Paisley Pattern Blouse"
    },
    {
      id: 2,
      image: SignatureBlouse2,
      alt: "Red & White Bird Pattern Blouse"
    },
    {
      id: 3,
      image: SignatureBlouse3,
      alt: "Green & Gold Elephant Design Blouse"
    }
  ];

  return (
    <section className="signature-section">
      <h2 className="signature-heading">Signature Collections</h2>
      <div className="signature-grid">
        {signatureBlouses.map((blouse) => (
          <div key={blouse.id} className="signature-card">
            <div className="image-frame">
              <img src={blouse.image} alt={blouse.alt} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SignatureCollection; 