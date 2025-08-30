import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateProductUrl } from "../utils/productUrl";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Debug: Log the product data
    // console.log('ProductCard - Product data:', {
    //   name: product?.name,
    //   seoUrl: product?.seoUrl,
    //   categoryType: product?.categoryType,
    //   category: product?.category,
    //   _id: product?._id
    // });
    
    const url = generateProductUrl(product, 'home');
    // console.log('ProductCard - Generated URL:', url);
    navigate(url);
  };

  // Use correct field names from Product model (matching HeroLanding)
  const productImage = product?.mainImage || product?.images?.[0] || product?.image || product?.imageUrl || product?.photo;
  const productName = product?.name || product?.title || product?.productName || 'Product Name';
  const productPrice = product?.sellingPrice || product?.price || product?.cost || '1,259';
  const originalPrice = product?.mrp || product?.originalPrice || product?.retailPrice;

  // Match HeroLanding image URL resolution
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/')) return `${window.location.origin}${imagePath}`;
    return `${window.location.origin}/uploads/${imagePath}`;
  };

  // Hover image behavior similar to HeroLanding: cycle gallery while hovered
  const baseImageUrl = useMemo(() => getImageUrl(productImage), [productImage]);
  const galleryImages = useMemo(() => {
    const fromAdditional = Array.isArray(product?.additionalImages) ? product.additionalImages : [];
    const fromImages = Array.isArray(product?.images) ? product.images : [];
    const raw = [...fromAdditional, ...fromImages].filter(Boolean);
    const resolved = raw.map(getImageUrl).filter(Boolean);
    // Dedupe and exclude the base image so first hover shows a change
    const seen = new Set();
    const unique = [];
    for (const url of resolved) {
      if (url && url !== baseImageUrl && !seen.has(url)) {
        seen.add(url);
        unique.push(url);
      }
    }
    return unique;
  }, [product?.additionalImages, product?.images, baseImageUrl]);

  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isHovered && galleryImages.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
      }, 1200);
    } else {
      setCurrentImageIndex(0);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovered, galleryImages.length]);

  // Main image stays constant; hover overlay is handled by CSS + overlay container

  return (
    <div
      onClick={handleClick}
      className={`product-card ${galleryImages.length > 0 ? 'has-gallery' : ''}`}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => {
        setIsHovered(true);
        setCurrentImageIndex(0);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image-container">
        <img
          src={baseImageUrl}
          alt={productName}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = baseImageUrl || "";
          }}
        />
        {galleryImages.length > 0 && (
          <div className="additional-images-container">
            {galleryImages.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`${productName} - ${idx + 1}`}
                className={`additional-image ${isHovered && idx === currentImageIndex ? 'active' : ''}`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
          </div>
        )}
        <div className="new-tag">New</div>
      </div>
      <div className="product-info">
        <h3 className="product-title">{productName}</h3>
        <div className="product-pricing">
          {originalPrice && originalPrice !== productPrice && (
            <span className="original-price">₹{originalPrice}</span>
          )}
          <span className="current-price">₹{productPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
