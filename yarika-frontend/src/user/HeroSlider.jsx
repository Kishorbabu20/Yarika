import ExclusiveBlousesBanner from '../assets/Blousebanner.png'; // adjust path as needed

function HeroSlider() {
  return (
        <div>
      {/* ...other components... */}
      <div className="main-banner">
        <img
          src={ExclusiveBlousesBanner}
          alt="Get Ready with Our Exclusive Blouses"
          className="main-banner-img"
        />
        </div>
      {/* ...other components... */}
    </div>
  );
}
export default HeroSlider;  