import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/ProductPage.css";
import api from "../config/axios";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/Breadcrumb";
const ProductCard = lazy(() => import("./ProductCard"));

const CategoryProductsPage = () => {
  const { dropdown, categoryType, category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();

        if (categoryType) {
          query.append("categoryType", categoryType);
        }
        
        if (category) {
          query.append("category", category);
        }

        // Add cache-busting parameter
        query.append("_t", Date.now());

        const res = await api.get(`/products?${query}`);
        
        if (Array.isArray(res.data)) {
        setProducts(res.data);
        } else if (res.data.products && Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryType, category]);

  const getFormattedTitle = (text) => {
    if (!text) return "";
    return text.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <>
      <Helmet>
        <title>{getFormattedTitle(categoryType)} - Ethnic Wear | Yarika</title>
        <meta name="description" content={`Shop our exclusive ${getFormattedTitle(categoryType)} collection with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`} />
        <meta name="keywords" content={`${getFormattedTitle(categoryType)}, ethnic wear, traditional clothing, designer wear, Yarika, ${category}`} />
        <meta property="og:title" content={`${getFormattedTitle(categoryType)} - Ethnic Wear | Yarika`} />
        <meta property="og:description" content={`Shop our exclusive ${getFormattedTitle(categoryType)} collection with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`} />
        <meta property="og:type" content="website" />
      </Helmet>
        
      <div className="content-section">
        <div className="breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
          <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
          {dropdown && (
            <>
                  <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
              <Link to={`/${dropdown}`}>{getFormattedTitle(dropdown)}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
            </>
          )}
          {categoryType && (
            <>
                  <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
              <Link to={`/${dropdown}/${categoryType}`}>{getFormattedTitle(categoryType)}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
            </>
          )}
          {category && (
            <>
                  <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getFormattedTitle(category)}</BreadcrumbPage>
                  </BreadcrumbItem>
            </>
          )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* Category Title */}
        <h1 className="category-title">
              {getFormattedTitle(categoryType)}
        </h1>

        {/* Category Types */}
        {category && (
          <div className="category-types">
            <span className="active">{getFormattedTitle(category)}</span>
            {/* Add other category types here */}
          </div>
        )}

        {/* Products Grid */}
          {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="product-card">
                <div className="product-image"></div>
                <div className="product-info">
                  <h3 className="product-name">Loading...</h3>
                  <p className="product-code">Loading...</p>
                  <p className="product-price">Loading...</p>
                </div>
                      </div>
                    ))}
                  </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No products found in this category.</p>
              <Link to="/" className="text-gold hover:underline mt-6 inline-block">
                Return to Home
              </Link>
            </div>
          ) : (
          <div className="product-grid">
            <Suspense fallback={<div>Loading...</div>}>
            {products.map((product) => (
                <ProductCard product={product} key={product._id} />
              ))}
                  </Suspense>
                </div>
        )}
      </div>
    </>
  );
};

export default CategoryProductsPage;
