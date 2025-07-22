/**
 * Utility function to generate product URLs based on context
 * @param {Object} product - Product object
 * @param {string} context - Context where the link is used ('dropdown', 'home', 'fallback')
 * @param {string} dropdown - Dropdown name (women, girls, kids, etc.)
 * @returns {string} - Generated URL
 */
export const generateProductUrl = (product, context = 'home', dropdown = 'women') => {
  if (!product) return '/';
  
  // Debug: Log the product data being processed
  console.log('=== generateProductUrl DEBUG ===');
  console.log('Product object:', product);
  console.log('Product seoUrl:', product?.seoUrl);
  console.log('Product seoUrl type:', typeof product?.seoUrl);
  console.log('Product categoryType:', product?.categoryType);
  console.log('Product category:', product?.category);
  console.log('Context:', context);
  console.log('Dropdown:', dropdown);
  console.log('All product keys:', Object.keys(product || {}));
  
  // If product has required fields for SEO URL
  if (product.seoUrl && product.categoryType && product.category) {
    console.log('SEO URL conditions met - using SEO URL');
    switch (context) {
      case 'dropdown':
        // From dropdown navigation: /{dropdown}/{categoryType}/{category}/{productSlug}
        const dropdownUrl = `/${dropdown}/${product.categoryType}/${product.category}/${product.seoUrl}`;
        console.log('generateProductUrl - Dropdown URL:', dropdownUrl);
        return dropdownUrl;
      
      case 'home':
      default:
        // From other pages: /home/{categoryType}/{category}/{productSlug}
        const homeUrl = `/home/${product.categoryType}/${product.category}/${product.seoUrl}`;
        console.log('generateProductUrl - Home URL:', homeUrl);
        return homeUrl;
    }
  }
  
  // Fallback to ID-based URL
  console.log('SEO URL conditions NOT met - using fallback URL');
  console.log('Missing fields:', {
    seoUrl: !product.seoUrl ? 'MISSING' : 'PRESENT',
    categoryType: !product.categoryType ? 'MISSING' : 'PRESENT',
    category: !product.category ? 'MISSING' : 'PRESENT'
  });
  const fallbackUrl = `/product/${product._id}`;
  console.log('generateProductUrl - Fallback URL:', fallbackUrl);
  return fallbackUrl;
};

/**
 * Get the appropriate context for a component
 * @param {string} componentName - Name of the component
 * @returns {string} - Context type
 */
export const getComponentContext = (componentName) => {
  switch (componentName) {
    case 'ProductListSection':
      return 'dropdown'; // Used in category pages from navigation
    case 'ProductCard':
      return 'home'; // Used in general product listings
    case 'WishlistPage':
      return 'home'; // Not from dropdown navigation
    default:
      return 'home';
  }
}; 