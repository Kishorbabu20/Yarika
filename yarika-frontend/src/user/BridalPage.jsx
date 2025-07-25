import React, { useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import BridalCollections from "./BridalCollections";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/Breadcrumb";

const BridalPage = () => {
  const filtersRef = useRef(null);
  useEffect(() => {
    if (filtersRef.current) {
      filtersRef.current.scrollLeft = 0;
    }
  }, []);
  return (
    <div className="bridal-page">
      <Helmet>
        <title>Bridal Collections - Yarika</title>
        <meta name="description" content="Discover Yarika's exclusive bridal lehengas and gowns. Shop premium bridal collections with exquisite craftsmanship and timeless elegance." />
        <meta name="keywords" content="bridal, lehenga, gown, wedding, Yarika, bridal collections, Indian bridal wear" />
        <meta property="og:title" content="Bridal Collections - Yarika" />
        <meta property="og:description" content="Discover Yarika's exclusive bridal lehengas and gowns. Shop premium bridal collections with exquisite craftsmanship and timeless elegance." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="container">
        <div className="breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Bridal</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <h1 className="category-title">Bridal Collections</h1>
        <h2 className="section-label" style={{marginBottom: '2rem'}}>Lehengas & Gowns for Your Special Day</h2>
        {/* Optionally add category-types here if needed */}
        {/* If you add a .category-filters section here, add ref={filtersRef} to it */}
        <BridalCollections />
      </div>
    </div>
  );
};

export default BridalPage; 