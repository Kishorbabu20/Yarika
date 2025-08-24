import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../components/ui/Select";
import AddProductForm from "../components/forms/AddProductForm"; 
import "../styles/Products.css";
import { useQuery } from '@tanstack/react-query';
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useParams } from "react-router-dom";

// Color mapping object
const COLOR_MAP = {
  // Default colors
  "4": "Black",
  "8": "White",
  "2": "Red",
  "5": "Blue",
  "11": "Green",
  "14": "Orange",
  "13": "Brown",
  // Additional colors
  "34": "Off White",
  "10": "Bright Red",
  "6": "Maroon",
  "9": "Navy",
  "7": "Ramar Green",
  "12": "Dark Green",
  "35": "Olive Green",
  "26": "Dark Skin",
  "28": "Light Skin",
  "22": "Pink",
  "27": "Baby Pink",
  "19": "Light Grey",
  "37": "Grey",
  "20": "Ramar Blue",
  "36": "Mustard",
  "101": "Rose Pink",
  "102": "Gold",
  "103": "Silver"
};

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await api.get("/products/stats");
      console.log("Fetched stats:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.append("search", searchTerm);
      if (status !== "all") query.append("status", status);
      if (category !== "all") query.append("categoryType", category); // <-- use categoryType
      const res = await api.get(`/products?${query.toString()}`);
      console.log('Fetched products:', res.data);
      
      // Debug: Check color data for first few products
      res.data.slice(0, 3).forEach((product, index) => {
        console.log(`Product ${index + 1} (${product.name}):`, {
          colors: product.colors,
          colorsType: typeof product.colors,
          isArray: Array.isArray(product.colors),
          colorsLength: product.colors ? product.colors.length : 0
        });
      });
      
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "out-of-stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get color name from ID
  const getColorName = (colorId) => {
    return COLOR_MAP[colorId] || colorId;
  };

  const getProductColors = (product) => {
    // The backend already populates colors as an array of objects with name and code
    if (product.colors && Array.isArray(product.colors)) {
      console.log('Product colors:', product.colors);
      
      // Handle both object format (from backend population) and string format (fallback)
      return product.colors.map(color => {
        if (typeof color === 'object' && color.name && color.code) {
          return color; // Already in correct format
        } else if (typeof color === 'string') {
          // Fallback: if color is a string, try to get from COLOR_MAP
          return {
            name: getColorName(color),
            code: color
          };
        } else {
          // Unknown format, return as is
          return {
            name: String(color),
            code: String(color)
          };
        }
      });
    }
    console.log('No colors found for product:', product.name);
    return [];
  };

  const { data: stats, refetch } = useQuery({
    queryKey: ['productStats'],
    queryFn: fetchStats,
    refetchInterval: 5000,
  });

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, status, category]);

  return (
    <>
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header title="Products" />
        <ChangePasswordModal isOpen={showChangePassword} onRequestClose={() => setShowChangePassword(false)} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div className="products-section-row" style={{ margin: '32px 0 0 0' }}>
          <div className="products-section-title">Product Inventory</div>
          <Button
                onClick={() => navigate('/admin/add-product')}
            className="add-product-btn"
          >
            + Add New Product
          </Button>
            </div>
        </div>

          {/* Stat Cards */}
        <div className="products-stats-row" style={{ margin: '32px 0 0 0' }}>
          <div className="stat-card">
              <div className="stat-value">{String(stats?.totalProducts || 0)}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
              <div className="stat-value stat-green">{String(stats?.activeProducts || 0)}</div>
            <div className="stat-label">Active Products</div>
          </div>
          <div className="stat-card">
              <div className="stat-value stat-yellow">{String(stats?.lowStock || 0)}</div>
              <div className="stat-label">Low Stock</div>
          </div>
          <div className="stat-card">
              <div className="stat-value stat-red">{String(stats?.outOfStock || 0)}</div>
              <div className="stat-label">Out of Stock</div>
          </div>
          <div className="stat-card">
              <div className="stat-value stat-gold">
                ₹{String(stats?.inventoryValue?.toLocaleString() || 0)}
              </div>
              <div className="stat-label">Inventory Value</div>
            </div>
          </div>

          {/* Add Product Form (for editing only) */}
          {editProduct && (
          <div className="mb-10" style={{ margin: '32px 0 0 0' }}>
            <AddProductForm
              product={editProduct}
                onClose={() => { setEditProduct(null); }}
              onProductAdded={() => {
                console.log('onProductAdded called');
                fetchProducts();
                refetch();
                setEditProduct(null);
                window.dispatchEvent(new Event('product-added'));
              }}
            />
          </div>
        )}

        {/* Filters */}
        <div className="products-filters-row" style={{ margin: '32px 0 0 0' }}>
          <div className="filter-group">
            <label className="filter-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-2xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="active">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-2xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                  <option value="readymade-blouse">Blouse</option>
                  <option value="leggings">Leggings</option>
                  <option value="readymade-blouse-cloth">Blouse Cloth</option>
                  <option value="trending">Trending</option>
              </select>
          </div>
        </div>

          {/* Manage Products Table */}
        <div className="products-table-section" style={{ 
          background: '#fff', 
          borderRadius: '12px',
          border: '1.5px solid #e5e5e5',
          boxShadow: '0 2px 8px rgba(198,170,98,0.04)',
          margin: '32px 0 0 0',
          overflow: 'hidden'
        }}>
          <div className="products-table-title" style={{ padding: '24px 24px 16px 24px', borderBottom: '1.5px solid #e5e5e5' }}>Manage Products</div>
            <div style={{ overflowX: 'auto' }}>
              <table className="products-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                  <tr style={{ background: '#faf9f6' }}>
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>DATE</th>
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>CODE</th>
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>NAME</th>
                      <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>CATEGORY</th>
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>SIZE</th>
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>STOCK</th>
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>PRICE</th>
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>MRP</th>
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>COLOR</th>
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>STATUS</th>
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                    <tr>
                      <td colSpan="11" style={{ textAlign: "center", padding: '24px', color: '#666' }}>
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                        <td style={{ padding: '16px', color: '#444', whiteSpace: 'nowrap' }}>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-"}</td>
                        <td style={{ padding: '16px', color: '#444', whiteSpace: 'nowrap' }}>{String(product.code || "-")}</td>
                        <td style={{ padding: '16px', color: '#444' }}>{String(product.name || "-")}</td>
                          <td style={{ padding: '16px', color: '#444' }}>{String(product.categoryType || "-")}</td>
                        <td style={{ padding: '16px', color: '#444' }}>{Array.isArray(product.sizes) ? product.sizes.join(", ") : "-"}</td>
                        <td style={{ padding: '16px', color: '#444' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px' 
                          }}>
                            {product.totalStock || 0}
                            {product.sizeStocks && (
                              <span title={Object.entries(product.sizeStocks)
                                .map(([size, stock]) => `${size}: ${stock}`)
                                .join('\n')}
                                style={{ cursor: 'help', color: '#666', fontSize: '12px' }}>
                                (i)
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px', color: '#444' }}>₹{product.sellingPrice}</td>
                        <td style={{ padding: '16px', color: '#444' }}>₹{product.mrp}</td>
                        <td style={{ padding: '16px', color: '#444' }}>
                          {getProductColors(product).length > 0
                            ? getProductColors(product).map((color, idx) => (
                                <span key={idx} style={{ display: "inline-flex", alignItems: "center", marginRight: 8 }}>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: 16,
                                      height: 16,
                                      borderRadius: "50%",
                                      background: color.code,
                                      marginRight: 4,
                                      border: "1px solid #ccc"
                                    }}
                                  />
                                  {color.name}
                                </span>
                              ))
                            : "-"}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span className={`status-badge ${product.totalStock > 0 && product.status === 'active' ? "status-active" : "status-inactive"}`}>
                            {product.totalStock > 0 && product.status === 'active' ? "In Stock" : "Out Of Stock"}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditProduct(product._id)}
                              style={{ color: '#b19049' }}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(product._id)}
                              style={{ color: '#dc2626' }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
