import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import YarikaLogo from "../assets/YarikaLogo1.png";
import BlouseBanner from "../assets/Blousebanner.png";
import ReadymadeBlouseNav from "../assets/Readymade blouse nav img.png";
import MaterialNav from "../assets/material nav img.png";
import LeggingNav from "../assets/legging nav img.png";
import { Search, MapPin, User, Heart, ShoppingBag, Menu } from "lucide-react";
import WhatsAppButton from "../components/WhatsAppButton";
import ScrollToTop from "../components/ScrollToTop";
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
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [selectedCategory, setSelectedCategory] = useState('women');
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState(null);
  // Mobile drawer specific open states
  const [mobileOpenGroup, setMobileOpenGroup] = useState(null); // e.g., 'women', 'kids', 'bridal'
  const [mobileOpenSub, setMobileOpenSub] = useState(null); // e.g., 'women-readymade'
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const announcements = [
    "New Styles On Sale: Up To 40% Off",
    "FREE Shipping All Over INDIA",
    "New Stock Updated Every Week",
    "Your One Stop Destination",
    "Delivering Love World Wide"
  ];

  useEffect(() => {
    const updateLoginState = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setUserName(localStorage.getItem("userName") || "");
    };
    window.addEventListener("userLoggedIn", updateLoginState);
    window.addEventListener("storage", updateLoginState);
    return () => {
      window.removeEventListener("userLoggedIn", updateLoginState);
      window.removeEventListener("storage", updateLoginState);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = (dropdownName) => {
    setActiveDropdown(dropdownName);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
    // Also close mobile dropdowns when mouse leaves
    setMobileActiveDropdown(null);
  };

  const handleMobileDropdownToggle = (dropdownName) => {
    if (mobileActiveDropdown === dropdownName) {
      setMobileActiveDropdown(null);
    } else {
      setMobileActiveDropdown(dropdownName);
    }
  };

  // Mobile drawer: toggle helpers
  const toggleMobileGroup = (groupName) => {
    setMobileOpenGroup(prev => (prev === groupName ? null : groupName));
    setMobileOpenSub(null);
  };
  const toggleMobileSub = (subName) => {
    setMobileOpenSub(prev => (prev === subName ? null : subName));
  };

  const handleDropdownLinkClick = () => {
    // Close all dropdowns when a link is clicked
    setActiveDropdown(null);
    setMobileActiveDropdown(null);
    
    // Force close with a small delay to ensure it works
    setTimeout(() => {
      setActiveDropdown(null);
      setMobileActiveDropdown(null);
    }, 100);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
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

  const handleFeaturedClick = () => {
    navigate("/");
    // Add a small delay to ensure the page loads before scrolling
    setTimeout(() => {
      const featuredSection = document.getElementById('featured');
      if (featuredSection) {
        featuredSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSearchIconClick = () => {
    if (isMobile()) {
      setMobileSearchOpen(prev => !prev);
    } else {
      handleSearch();
    }
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

  // Mobile navbar logic completely removed - always show desktop navigation

  return (
    <div className="nav-wrapper">
      {/* Top announcement marquee */}
      <div className="announcement-bar">
        <div className="marquee" role="marquee" aria-label="site announcements">
          <div className="marquee-track">
            {announcements.map((text, idx) => (
              <span key={`m1-${idx}`} className="announcement-item">
                {text}
                <span className="announcement-sep" />
              </span>
            ))}
          </div>
          {announcements.length > 1 ? (
            <div className="marquee-track" aria-hidden="true">
              {announcements.map((text, idx) => (
                <span key={`m2-${idx}`} className="announcement-item">
                  {text}
                  <span className="announcement-sep" />
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      
      <nav className="navigation-bar">
        {/* Left: Categories */}
        <div className="nav-left" onClick={() => setMobileMenuOpen(true)}>
          <div className="nav-categories">
            <div
              className={`nav-item${selectedCategory === 'women' ? ' active' : ''}`}
              onClick={() => setSelectedCategory('women')}
            >
              <span>WOMEN</span>
            </div>

            <div
              className={`nav-item${selectedCategory === 'kids' ? ' active' : ''}`}
              onClick={() => setSelectedCategory('kids')}
            >
              <span>KIDS</span>
            </div>

            <div
              className={`nav-item${selectedCategory === 'bridal' ? ' active' : ''}`}
              onClick={() => setSelectedCategory('bridal')}
            >
              <span>BRIDAL</span>
            </div>
          </div>
      </div>

        {/* Center: Logo */}
      <div className="navbar-center">
          <Link to="/" className="logo">
            <img src={YarikaLogo} alt="Yarika Logo" />
          </Link>
        </div>

        {/* Right: Search + Icons */}
        <div className="navbar-right">
        {!isMobileView ? (
  <div className="search-container">
    <input 
      type="text" 
      placeholder="Search"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyPress={handleKeyPress}
    />
    <span className="search-icon" onClick={handleSearchIconClick} aria-label="Open search" style={{ cursor: 'pointer' }}>
      <Search size={16} />
    </span>
  </div>
) : (
  <button 
    className="mobile-search-btn"
    onClick={handleSearchIconClick}
    aria-label="Open search"
    style={{ /* styling here */ }}
  >
    <Search size={20} />
  </button>
)}

            <div className="user-actions">
              <button className="icon-btn" onClick={handleLoginClick}>
            <User size={20} />
          </button>
              <button className="icon-btn" onClick={handleWishlistClick}>
            <Heart size={20} />
          </button>
              <button className="icon-btn" onClick={handleCartClick}>
                <div className="cart-icon">
              <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="cart-badge">{totalItems}</span>
                  )}
            </div>
          </button>
            </div>
        </div>
      </nav>

      {/* Mobile inline search bar (appears under navbar) */}
      {mobileSearchOpen && (
        <form className="mobile-inline-search-bar" onSubmit={handleSearch}>
          <div className="mobile-search-container">
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input"
            />
            <button type="submit" className="mobile-search-submit">
              <Search size={16} />
            </button>
            <button type="button" className="mobile-search-close" aria-label="Close" onClick={handleMobileSearchClose}>×</button>
          </div>
        </form>
      )}

      {/* Mobile full-screen menu drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-panel">
            <button className="mobile-menu-close" aria-label="Close" onClick={() => setMobileMenuOpen(false)}>×</button>
            <div className="mobile-menu-header">
              <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
                <img src={YarikaLogo} alt="Yarika Logo" />
              </Link>
            </div>

            <div className="mobile-menu-content">
              <button className="mobile-section-title" style={{ color: '#deb33f' }} onClick={() => { setMobileMenuOpen(false); handleFeaturedClick(); }}>FEATURED</button>
              <a className="mobile-section-title" href="https://www.google.com/maps/place/Zillion+Threads/@11.011062,76.8626941,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba75d912d3d1dd9:0xdfd0242d8a996267!8m2!3d11.011062!4d76.865269!16s%2Fg%2F11ybt6v8jq?entry=ttu&g_ep=EgoyMDI1MDcyMi4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">STORE LOCATOR</a>

              {/* WOMEN */}
              <div className="mobile-group">
                <button className="mobile-group-header" onClick={() => toggleMobileGroup('women')}>
                  <span>WOMEN</span>
                  <span className={`chevron ${mobileOpenGroup === 'women' ? 'up' : ''}`}>▾</span>
                </button>
                {mobileOpenGroup === 'women' && (
                  <div className="mobile-subgroup">
                    {/* Readymade Blouse */}
                    <button className="mobile-sub-header" onClick={() => toggleMobileSub('women-readymade')}>
                      <span>Readymade Blouse</span>
                      <span className={`chevron ${mobileOpenSub === 'women-readymade' ? 'up' : ''}`}>▾</span>
                    </button>
                    {mobileOpenSub === 'women-readymade' && (
                      <div className="mobile-links" onClick={() => { handleDropdownLinkClick(); setMobileMenuOpen(false); }}>
                        {categoryTypes.women["readymade-blouse"].items.map((item, idx) => (
                          <Link key={`m-w-rb-${idx}`} to={getCategoryLink('women','readymade-blouse', item)} className="mobile-link">{item.name}</Link>
                        ))}
                      </div>
                    )}

                    {/* Leggings */}
                    <button className="mobile-sub-header" onClick={() => toggleMobileSub('women-leggings')}>
                      <span>Leggings</span>
                      <span className={`chevron ${mobileOpenSub === 'women-leggings' ? 'up' : ''}`}>▾</span>
                    </button>
                    {mobileOpenSub === 'women-leggings' && (
                      <div className="mobile-links" onClick={() => { handleDropdownLinkClick(); setMobileMenuOpen(false); }}>
                        {categoryTypes.women.leggings.items.map((item, idx) => (
                          <Link key={`m-w-leg-${idx}`} to={getCategoryLink('women','leggings', item)} className="mobile-link">{item.name}</Link>
                        ))}
                      </div>
                    )}

                    {/* Materials */}
                    <button className="mobile-sub-header" onClick={() => toggleMobileSub('women-materials')}>
                      <span>Readymade Blouse Cloth</span>
                      <span className={`chevron ${mobileOpenSub === 'women-materials' ? 'up' : ''}`}>▾</span>
                    </button>
                    {mobileOpenSub === 'women-materials' && (
                      <div className="mobile-links" onClick={() => { handleDropdownLinkClick(); setMobileMenuOpen(false); }}>
                        {categoryTypes.women["readymade-blouse-cloth"].items.map((item, idx) => (
                          <Link key={`m-w-mat-${idx}`} to={getCategoryLink('women','readymade-blouse-cloth', item)} className="mobile-link">{item.name}{item.highlight ? ` (${item.highlight})` : ''}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* KIDS */}
              <div className="mobile-group">
                <button className="mobile-group-header" onClick={() => toggleMobileGroup('kids')}>
                  <span>KIDS</span>
                  <span className={`chevron ${mobileOpenGroup === 'kids' ? 'up' : ''}`}>▾</span>
                </button>
                {mobileOpenGroup === 'kids' && (
                  <div className="mobile-subgroup">
                    <button className="mobile-sub-header" onClick={() => toggleMobileSub('kids-leggings')}>
                      <span>Leggings</span>
                      <span className={`chevron ${mobileOpenSub === 'kids-leggings' ? 'up' : ''}`}>▾</span>
                    </button>
                    {mobileOpenSub === 'kids-leggings' && (
                      <div className="mobile-links" onClick={() => { handleDropdownLinkClick(); setMobileMenuOpen(false); }}>
                        {categoryTypes.girls.leggings.items.map((item, idx) => (
                          <Link key={`m-k-leg-${idx}`} to={getCategoryLink('girls','leggings', item)} className="mobile-link">{item.name}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BRIDAL */}
              <div className="mobile-group">
                <button className="mobile-group-header" onClick={() => toggleMobileGroup('bridal')}>
                  <span>BRIDAL</span>
                  <span className={`chevron ${mobileOpenGroup === 'bridal' ? 'up' : ''}`}>▾</span>
                </button>
                {mobileOpenGroup === 'bridal' && (
                  <div className="mobile-links" onClick={() => { setMobileMenuOpen(false); }}>
                    <Link to={getCategoryLink('women','bridal',{slug:'bridal-lehenga'})} className="mobile-link">Bridal Lehenga</Link>
                    <Link to={getCategoryLink('women','bridal',{slug:'bridal-gown'})} className="mobile-link">Bridal Gown</Link>
                  </div>
                )}
              </div>
            </div>

            <form className="mobile-search-bar" onSubmit={handleSearch}>
              <span className="mobile-search-icon"><Search size={16} /></span>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="mobile-search-submit" aria-label="Search" />
            </form>
          </div>
        </div>
      )}

      {/* Sub-navigation bar with dropdowns */}
      <div className={`subnav-bar hide-on-mobile ${selectedCategory ? 'has-content' : ''}`}>
        <div className="subnav-inner">
          {/* First row: Main category buttons - visible on all screen sizes */}
          <div className="subnav-primary">
            <div
              className={`subnav-category-btn${selectedCategory === 'women' ? ' active' : ''}`}
              onClick={() => setSelectedCategory('women')}
            >
              WOMEN
            </div>
            <span className="subnav-sep" />
            
            <div
              className={`subnav-category-btn${selectedCategory === 'kids' ? ' active' : ''}`}
              onClick={() => setSelectedCategory('kids')}
            >
              KIDS
            </div>
            <span className="subnav-sep" />
            
            <div
              className={`subnav-category-btn${selectedCategory === 'bridal' ? ' active' : ''}`}
              onClick={() => setSelectedCategory('bridal')}
            >
              BRIDAL
            </div>
          </div>
          
          {/* Second row: Secondary navigation items - Featured, Store Locator, etc. */}
          <div className="subnav-secondary">
          <div className="subnav-link" style={{cursor: 'pointer'}} onClick={handleFeaturedClick}>FEATURED</div>
          <span className="subnav-sep" />
          
          {selectedCategory === 'women' && (
            <>
              <div 
                className="subnav-dropdown"
                onMouseEnter={() => handleMouseEnter('women-readymade')}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleMobileDropdownToggle('women-readymade')}
              >
                <span className="subnav-link">READYMADE BLOUSE</span>
                {(activeDropdown === 'women-readymade' || mobileActiveDropdown === 'women-readymade') && (
                  <div className={`subnav-dropdown-menu ${mobileActiveDropdown === 'women-readymade' ? 'active' : ''}`} onClick={handleDropdownLinkClick}>
                    <div className="dropdown-content">
                      <div className="dropdown-list">
                        {categoryTypes.women["readymade-blouse"].items.map((item, idx) => (
                          <Link key={idx} to={getCategoryLink('women', 'readymade-blouse', item)} className="subnav-dropdown-item">
                            <span className="diamond-bullet">◆</span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                      <div className="dropdown-image">
                        <img src={ReadymadeBlouseNav} alt="Readymade Blouse Collection" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="subnav-sep" />
              
              <div 
                className="subnav-dropdown"
                onMouseEnter={() => handleMouseEnter('women-leggings')}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleMobileDropdownToggle('women-leggings')}
              >
                <span className="subnav-link">LEGGINGS</span>
                {(activeDropdown === 'women-leggings' || mobileActiveDropdown === 'women-leggings') && (
                  <div className={`subnav-dropdown-menu ${mobileActiveDropdown === 'women-leggings' ? 'active' : ''}`} onClick={handleDropdownLinkClick}>
                    <div className="dropdown-content">
                      <div className="dropdown-list">
                        {categoryTypes.women.leggings.items.map((item, idx) => (
                          <Link key={idx} to={getCategoryLink('women', 'leggings', item)} className="subnav-dropdown-item">
                            <span className="diamond-bullet">◆</span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                      <div className="dropdown-image">
                        <img src={LeggingNav} alt="Leggings Collection" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="subnav-sep" />
              
              <div 
                className="subnav-dropdown"
                onMouseEnter={() => handleMouseEnter('women-materials')}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleMobileDropdownToggle('women-materials')}
              >
                <span className="subnav-link">MATERIALS</span>
                {(activeDropdown === 'women-materials' || mobileActiveDropdown === 'women-materials') && (
                  <div className={`subnav-dropdown-menu ${mobileActiveDropdown === 'women-materials' ? 'active' : ''}`} onClick={handleDropdownLinkClick}>
                    <div className="dropdown-content">
                      <div className="dropdown-list">
                        {categoryTypes.women["readymade-blouse-cloth"].items.map((item, idx) => (
                          <Link key={idx} to={getCategoryLink('women', 'readymade-blouse-cloth', item)} className="subnav-dropdown-item">
                            <span className="diamond-bullet">◆</span>
                            {item.name}
                            {item.highlight && <span className="highlight"> ({item.highlight})</span>}
                          </Link>
                        ))}
                      </div>
                      <div className="dropdown-image">
                        <img src={MaterialNav} alt="Materials Collection" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <span className="subnav-sep" />
            </>
          )}
          
          {selectedCategory === 'kids' && (
            <>
              <div 
                className="subnav-dropdown"
                onMouseEnter={() => handleMouseEnter('kids-leggings')}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleMobileDropdownToggle('kids-leggings')}
              >
                <span className="subnav-link">LEGGINGS</span>
                {(activeDropdown === 'kids-leggings' || mobileActiveDropdown === 'kids-leggings') && (
                  <div className={`subnav-dropdown-menu ${mobileActiveDropdown === 'kids-leggings' ? 'active' : ''}`} onClick={handleDropdownLinkClick}>
                    {categoryTypes.girls.leggings.items.map((item, idx) => (
                      <Link key={idx} to={getCategoryLink('girls', 'leggings', item)} className="subnav-dropdown-item">
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <span className="subnav-sep" />
            </>
          )}
          
          {selectedCategory === 'bridal' && (
            <>
              <Link to={getCategoryLink('women','bridal',{slug:'bridal-lehenga'})} className="subnav-link">LEHENGA</Link>
              <span className="subnav-sep" />
              <Link to={getCategoryLink('women','bridal',{slug:'bridal-gown'})} className="subnav-link">GOWNS</Link>
              <span className="subnav-sep" />
            </>
          )}
          
          <a
            className="subnav-link"
              href="https://www.google.com/maps/place/Zillion+Threads/@11.011062,76.8626941,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba75d912d3d1dd9:0xdfd0242d8a996267!8m2!3d11.011062!4d76.865269!16s%2Fg%2F11ybt6v8jq?entry=ttu&g_ep=EgoyMDI1MDcyMi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
          >
            STORE LOCATOR
          </a>
          </div>
        </div>
      </div>
      
      {/* Scroll to Top Button - appears when scrolling */}
      <ScrollToTop />
      
      {/* WhatsApp Button - appears on every page */}
      <WhatsAppButton />
    </div>
  );
};

export default NavigationBarSection;
