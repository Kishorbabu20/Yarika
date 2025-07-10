import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import YarikaLogo from "../Img/Yarika Logo (1).png";
import { Search, ChevronDown, MapPin, User, Heart, ShoppingBag } from "lucide-react";
import "../styles/Navbar.css";

function isMobile() {
  return window.innerWidth <= 768;
}

const NavigationBarSection = () => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems } = useCart();

  const handleMouseEnter = (dropdownName) => {
    setActiveDropdown(dropdownName);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleStoreLocatorClick = () => {
    navigate("/store-locator");
  };

  const handleLoginClick = () => {
    navigate("/profile");
  };

  const handleWishlistClick = () => {
    navigate("/wishlist");
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  // Updated category types to match the backend structure
  const categoryTypes = {
    women: {
      trending: {
        title: "Trending",
        items: [
          { name: "Best Sellers", slug: "best-sellers" },
          { name: "Signature Styles", slug: "signature-styles" }
        ]
      },
      "readymade-blouse": {
        title: "Readymade Blouse",
        items: [
          { name: "Aari Blouse", slug: "aari-blouse" },
          { name: "Designer Blouse", slug: "designer-blouse" },
          { name: "Embroidery Blouse", slug: "embroidery-blouse" },
          { name: "Ikat Blouse", slug: "ikat-blouse" },
          { name: "Kalamkari Blouse", slug: "kalamkari-blouse" },
          { name: "Plain Blouse", slug: "plain-blouse" },
          { name: "Zardozi Blouse", slug: "zardozi-blouse" }
        ]
      },
      leggings: {
          title: "Leggings",
        items: [
          { name: "Ankle Length Leggings", slug: "ankle-length-leggings" },
          { name: "Churidar Leggings", slug: "churidar-leggings" },
          { name: "Shimmer Leggings", slug: "shimmer-leggings" }
        ]
      },
      "readymade-blouse-cloth": {
        title: "Readymade Blouse Cloth",
        items: [
          { name: "Aari Cloth", slug: "aari-cloth" },
          { name: "Embroidery Cloth", slug: "embroidery-cloth" },
          { name: "Zardosi Cloth", slug: "zardosi-cloth" },
          { name: "Aari + Embroidery Cloth", slug: "aari-embroidery-cloth", highlight: "Combination" },
          { name: "Aari + Zardosi Cloth", slug: "aari-zardosi-cloth", highlight: "Combination" },
          { name: "Zardosi + Embroidery Cloth", slug: "zardosi-embroidery-cloth", highlight: "Combination" }
        ]
      }
    },
    girls: {
      trending: {
        title: "Trending",
        items: [
          { name: "Best Sellers", slug: "best-sellers" },
          { name: "Signature Styles", slug: "signature-styles" }
        ]
      },
      "readymade-blouse": {
        title: "Readymade Blouse",
        items: [
          { name: "Aari Blouse", slug: "aari-blouse" },
          { name: "Designer Blouse", slug: "designer-blouse" },
          { name: "Embroidery Blouse", slug: "embroidery-blouse" },
          { name: "Ikat Blouse", slug: "ikat-blouse" },
          { name: "Kalamkari Blouse", slug: "kalamkari-blouse" },
          { name: "Plain Blouse", slug: "plain-blouse" },
          { name: "Zardozi Blouse", slug: "zardozi-blouse" }
        ]
      },
      leggings: {
          title: "Leggings",
        items: [
          { name: "Ankle Length Leggings", slug: "ankle-length-leggings" },
          { name: "Churidar Leggings", slug: "churidar-leggings" },
          { name: "Shimmer Leggings", slug: "shimmer-leggings" },
          { name: "Girls Leggings", slug: "girls-leggings" }
        ]
      },
      "readymade-blouse-cloth": {
        title: "Readymade Blouse Cloth",
        items: [
          { name: "Aari Cloth", slug: "aari-cloth" },
          { name: "Embroidery Cloth", slug: "embroidery-cloth" },
          { name: "Zardosi Cloth", slug: "zardosi-cloth" },
          { name: "Aari + Embroidery Cloth", slug: "aari-embroidery-cloth", highlight: "Combination" },
          { name: "Aari + Zardosi Cloth", slug: "aari-zardosi-cloth", highlight: "Combination" },
          { name: "Zardosi + Embroidery Cloth", slug: "zardosi-embroidery-cloth", highlight: "Combination" }
        ]
      }
    },
    kids: {}
  };

  const getCategoryLink = (categoryType, item) => {
    return `/products/${categoryType}/${item.slug}`;
  };

  return (
    <div className="nav-wrapper">
      <nav className="navigation-bar">
        <div className="nav-left">
          <Link to="/" className="logo">
            <img src={YarikaLogo} alt="Yarika Logo" />
          </Link>
          <div className="nav-categories">
            <div
              className="nav-item"
              onMouseEnter={() => { if (!isMobile()) setActiveDropdown('women'); }}
              onMouseLeave={() => { if (!isMobile()) setActiveDropdown(null); }}
              onClick={() => { if (isMobile()) setActiveDropdown(activeDropdown === 'women' ? null : 'women'); }}
            >
              <span>WOMEN</span>
              {activeDropdown === 'women' && (
                <div className="dropdown-menu">
                  <div className="dropdown-content">
                    {Object.entries(categoryTypes.women).map(([categoryType, category], index) => (
                      <div key={index} className="dropdown-column">
                        <h3>{category.title}</h3>
                        <ul>
                          {category.items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                                <Link to={getCategoryLink(categoryType, item)}>
                                {item.name}
                                {item.highlight && <span className="highlight"> ({item.highlight})</span>}
                                </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          </div>
        )}
            </div>
            <div
              className="nav-item"
              onMouseEnter={() => { if (!isMobile()) setActiveDropdown('girls'); }}
              onMouseLeave={() => { if (!isMobile()) setActiveDropdown(null); }}
              onClick={() => { if (isMobile()) setActiveDropdown(activeDropdown === 'girls' ? null : 'girls'); }}
            >
              <span>GIRLS</span>
              {activeDropdown === 'girls' && (
                <div className="dropdown-menu">
                  <div className="dropdown-content">
                    {Object.entries(categoryTypes.girls).map(([categoryType, category], index) => (
                      <div key={index} className="dropdown-column">
                        <h3>{category.title}</h3>
                        <ul>
                          {category.items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                                <Link to={getCategoryLink(categoryType, item)}>
                                {item.name}
                                {item.highlight && <span className="highlight"> ({item.highlight})</span>}
                                </Link>
                            </li>
                          ))}
                        </ul>
      </div>
          ))}
                  </div>
                </div>
              )}
            </div>
            <div
              className="nav-item"
              onMouseEnter={() => { if (!isMobile()) setActiveDropdown('kids'); }}
              onMouseLeave={() => { if (!isMobile()) setActiveDropdown(null); }}
              onClick={() => { if (isMobile()) setActiveDropdown(activeDropdown === 'kids' ? null : 'kids'); }}
            >
              <span>KIDS</span>
              {activeDropdown === 'kids' && (
                <div className="dropdown-menu">
                  <div className="dropdown-content">
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>

        <div className="content-wrapper">
      <div className="navbar-center">
        <div className="search-bar">
              <div className="search-icon" onClick={handleSearch}>
                <Search size={20} strokeWidth={1} />
              </div>
              <input 
                type="text" 
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
        </div>
      </div>

      <div className="navbar-right">
        <div className="icon-group">
              <button className="icon-item" onClick={handleStoreLocatorClick}>
            <MapPin size={20} />
                <span className="icon-label">Store Locator</span>
          </button>
              <button className="icon-item" onClick={handleLoginClick}>
            <User size={20} />
            <span className="icon-label">Login</span>
          </button>
              <button className="icon-item" onClick={handleWishlistClick}>
            <Heart size={20} />
            <span className="icon-label">Wishlist</span>
          </button>
              <button className="icon-item" onClick={handleCartClick}>
            <div className="bag-icon">
              <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="cart-badge">{totalItems}</span>
                  )}
            </div>
            <span className="icon-label">Bag</span>
          </button>
            </div>
        </div>
      </div>
    </nav>
    </div>
  );
};

export default NavigationBarSection;
