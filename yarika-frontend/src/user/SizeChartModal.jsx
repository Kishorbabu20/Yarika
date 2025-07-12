import React from 'react';
import '../styles/SizeChartModal.css';
import SizeChart from '../assets/Size Chart.jpg';

const SizeChartModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="size-chart-modal-overlay" onClick={onClose}>
      <div className="size-chart-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="size-chart-content">
          <h2>Size Chart</h2>
          <img 
            src={SizeChart}
            alt="Kalamkari Blouse Measurement Chart" 
            className="size-chart-image"
          />
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal; 