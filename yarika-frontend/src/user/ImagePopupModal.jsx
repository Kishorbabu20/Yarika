import React from 'react';
import '../styles/ImagePopupModal.css';

const ImagePopupModal = ({ isOpen, onClose, image }) => {
  if (!isOpen) return null;

  return (
    <div className="image-popup-overlay" onClick={onClose}>
      <div className="image-popup-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="image-popup-content">
          <img 
            src={image} 
            alt="Product View" 
            className="popup-image"
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePopupModal; 