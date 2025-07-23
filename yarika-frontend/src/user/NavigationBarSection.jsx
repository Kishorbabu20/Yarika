import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import YarikaLogo from "../assets/YarikaLogo1.png";
import { Search, ChevronDown, MapPin, User, Heart, ShoppingBag, Menu } from "lucide-react";
import "../styles/Navbar.css";

function isMobile() {
  return window.innerWidth <= 768;
}

const NavigationBarSection = () => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null); // Track which dropdown is open
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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

  const handleMenuClick = () => {
    // This function is not defined in the original file,
    // but the edit hint implies its existence.
    // For now, it will be a placeholder.
    console.log("Menu clicked");
  };

  const handleSearchClick = () => {
    setMobileSearchOpen(true);
  };
  const handleMobileSearchClose = () => {
    setMobileSearchOpen(false);
  };

  // Updated category types to match the backend structure
  const categoryTypes = {
    women: {
      bridal: {
        title: "Bridal",
        items: [
          { name: "Bridal Lehenga", slug: "bridal-lehenga" },
          { name: "Bridal Gown", slug: "bridal-gown" }
        ]
      },
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
          { name: "Aari Readymade Blouse", slug: "aari-readymade-blouse" },
          { name: "Designer Readymade Blouse", slug: "designer-readymade-blouse" },
          { name: "Embroidery Readymade Blouse", slug: "embroidery-readymade-blouse" },
          { name: "Ikat Readymade Blouse", slug: "ikat-readymade-blouse" },
          { name: "Kalamkari Readymade Blouse", slug: "kalamkari-readymade-blouse" },
          { name: "Plain Readymade Blouse", slug: "plain-readymade-blouse" },
          { name: "Zardozi Readymade Blouse", slug: "zardozi-readymade-blouse" }
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

  const getCategoryLink = (dropdown, categoryType, item) => {
    return `/${dropdown}/${categoryType}/${item.slug}`;
  };

  const isMobileView = window.innerWidth <= 768;

  if (isMobileView) {
    return (
      <>
      <div className="mobile-navbar">
          <button className="navbar-icon menu-icon" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={28} color="#caa75d" />
        </button>
        <div className="navbar-logo">
            <Link to="/">
          <img src={YarikaLogo} alt="Yarika Logo" className="mobile-navbar-logo" />
            </Link>
        </div>
        <div className="navbar-icons">
          <button className="navbar-icon" onClick={handleSearchClick}>
            <Search size={24} color="#111" />
          </button>
          <button className="navbar-icon" onClick={handleCartClick}>
            <ShoppingBag size={24} color="#111" />
          </button>
        </div>
      </div>
        {mobileSearchOpen && (
          <div className="mobile-search-overlay" onClick={handleMobileSearchClose}>
            <div className="mobile-search-bar" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                className="mobile-search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
              />
              <button className="mobile-search-btn" onClick={handleSearch}>
                <Search size={20} />
              </button>
              <button className="mobile-search-close" onClick={handleMobileSearchClose}>
                ×
              </button>
            </div>
          </div>
        )}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu" onClick={e => e.stopPropagation()}>
              <button className="close-menu" onClick={() => setMobileMenuOpen(false)}>×</button>
              <div className="mobile-menu-links">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <div>
                  <button className="mobile-dropdown-btn" onClick={() => setMobileDropdown(mobileDropdown === 'women' ? null : 'women')}>
                    Women
                  </button>
                  {mobileDropdown === 'women' && (
                    <ul className="mobile-submenu">
                      {Object.entries(categoryTypes.women).map(([categoryType, category], idx) => (
                        <li key={idx} style={{marginBottom: '8px'}}>
                          <span style={{fontWeight: 'bold', fontSize: '1em'}}>{category.title}</span>
                          <ul style={{marginLeft: '12px', marginTop: '4px'}}>
                            {category.items.map((item, itemIdx) => (
                              <li key={itemIdx}>
                                <Link to={getCategoryLink('women', categoryType, item)} onClick={() => setMobileMenuOpen(false)}>
                                  {item.name}
                                  {item.highlight && <span className="highlight"> ({item.highlight})</span>}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <button className="mobile-dropdown-btn" onClick={() => setMobileDropdown(mobileDropdown === 'girls' ? null : 'girls')}>
                    Girls
                  </button>
                  {mobileDropdown === 'girls' && (
                    <ul className="mobile-submenu">
                      {Object.entries(categoryTypes.girls).map(([categoryType, category], idx) => (
                        <li key={idx} style={{marginBottom: '8px'}}>
                          <span style={{fontWeight: 'bold', fontSize: '1em'}}>{category.title}</span>
                          <ul style={{marginLeft: '12px', marginTop: '4px'}}>
                            {category.items.map((item, itemIdx) => (
                              <li key={itemIdx}>
                                <Link to={getCategoryLink('girls', categoryType, item)} onClick={() => setMobileMenuOpen(false)}>
                                  {item.name}
                                  {item.highlight && <span className="highlight"> ({item.highlight})</span>}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <button className="mobile-dropdown-btn" onClick={() => setMobileDropdown(mobileDropdown === 'kids' ? null : 'kids')}>
                    Kids
                  </button>
                  {mobileDropdown === 'kids' && (
                    <ul className="mobile-submenu">
                      {/* Add kids categories/items here if needed */}
                      <li>No categories available</li>
                    </ul>
                  )}
                </div>
              </div>
              <div className="mobile-menu-icons" style={{marginTop: '18px', alignItems: 'center'}}>
                <a
                  className="icon-item"
                  href="https://www.google.com/maps/search/?api=1&query=SF+No.+29%2F18%2C+Onapalayam%2C+Vadavalli+To+Thondamuthur+Road%2C+Coimbatore-641+109%2C+Tamilnadu%2C+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Store Locator"
                  style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#222', fontSize: '1.1rem', textDecoration: 'none'}}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MapPin size={22} className="gold-icon" />
                  <span>Store Locator</span>
                </a>
                <Link
                  to="/profile"
                  className="icon-item"
                  style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#222', fontSize: '1.1rem', textDecoration: 'none'}}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={22} />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="icon-item"
                  style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#222', fontSize: '1.1rem', textDecoration: 'none'}}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart size={22} />
                  <span>Wishlist</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="nav-wrapper">
      <nav className="navigation-bar">
        <div className="nav-left">
          <Link to="/" className="logo">
            <img src="/YarikaLogo1.png" alt="Yarika Logo" />
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
                                <Link to={getCategoryLink('women', categoryType, item)}>
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
                                <Link to={getCategoryLink('girls', categoryType, item)}>
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
              <a
                className="icon-item"
                href="https://www.google.com/maps/search/?api=1&query=SF+No.+29%2F18%2C+Onapalayam%2C+Vadavalli+To+Thondamuthur+Road%2C+Coimbatore-641+109%2C+Tamilnadu%2C+India"
                target="_blank"
                rel="noopener noreferrer"
                title="Store Locator"
              >
                <MapPin size={20} className="gold-icon" />
                <span className="icon-label">Store Locator</span>
              </a>
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
    {mobileMenuOpen && (
  <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
    <div className="mobile-menu" onClick={e => e.stopPropagation()}>
      <button className="close-menu" onClick={() => setMobileMenuOpen(false)}>×</button>
      <div className="mobile-menu-links">
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
        <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
        <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
        {/* Add your category dropdowns here as needed */}
      </div>
      <div className="mobile-menu-icons">
        <button onClick={() => { setMobileMenuOpen(false); handleLoginClick(); }}>
          <User size={24} /> Profile
        </button>
        <button onClick={() => { setMobileMenuOpen(false); handleWishlistClick(); }}>
          <Heart size={24} /> Wishlist
        </button>
        <button onClick={() => { setMobileMenuOpen(false); handleCartClick(); }}>
          <ShoppingBag size={24} /> Cart
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default NavigationBarSection;
