import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import Sidebar from "../components/Sidebar";
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
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/products/stats");
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
      if (category !== "all") query.append("category", category);

      const res = await api.get(`/api/products?${query.toString()}`);
      console.log('Fetched products:', res.data);  // Add this line to log the fetched data
      setProducts(res.data);
      console.log('Products updated:', res.data); // Add this line
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Delete failed:", error);
    }
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

  const { data: stats, refetch } = useQuery({
    queryKey: ['productStats'],
    queryFn: fetchStats,
    refetchInterval: 5000,
  });

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, status, category]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <>
          {/* Remove any extra space above the title */}
          <style>{`
            .analytics-header { margin-top: 0 !important; padding-top: 0 !important; }
            .analytics-header h2 { margin-top: 0 !important; padding-top: 0 !important; }
            .main-content { margin-top: 0 !important; padding-top: 0 !important; }
            .main-content > *:first-child { margin-top: 0 !important; padding-top: 0 !important; }
          `}</style>
          <div className="analytics-header">
            <h2>Products</h2>
            <div className="analytics-header-right">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="7"/><line x1="16" y1="16" x2="12.5" y2="12.5"/></svg>
                </span>
              </div>
              <span className="notification-icon">🔔</span>
              <span className="profile-icon" onClick={() => setShowChangePassword(true)}>👤</span>
            </div>
          </div>
        </>
        <ChangePasswordModal isOpen={showChangePassword} onRequestClose={() => setShowChangePassword(false)} />

        <div style={{ padding: '0 32px' }}>
          {/* Product Inventory Header */}
        <div className="products-section-row">
          <div className="products-section-title">Product Inventory</div>
          <Button
            onClick={() => setShowAddProduct(true)}
            className="add-product-btn"
          >
            + Add New Product
          </Button>
        </div>

          {/* Stat Cards */}
        <div className="products-stats-row">
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

          {/* Add Product Form */}
        {(showAddProduct || editProduct) && (
          <div className="mb-10">
            <AddProductForm
              product={editProduct}
              onClose={() => { setShowAddProduct(false); setEditProduct(null); }}
              onProductAdded={() => {
                console.log('onProductAdded called');
                fetchProducts();
                refetch();
                setEditProduct(null);
                setShowAddProduct(false);
              }}
            />
          </div>
        )}

        {/* Filters */}
        <div className="products-filters-row">
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
                <option value="dailywear">Dailywear</option>
                <option value="officewear">Officewear</option>
                <option value="partywear">Partywear</option>
              </select>
          </div>
        </div>

          {/* Manage Products Table */}
        <div className="products-table-section" style={{ 
          background: '#fff', 
          borderRadius: '12px',
          border: '1.5px solid #e5e5e5',
          boxShadow: '0 2px 8px rgba(198,170,98,0.04)',
          marginBottom: '32px',
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
                    <th style={{ padding: '12px 16px', color: '#666', fontSize: '14px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>GROUP</th>
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
                        <td style={{ padding: '16px', color: '#444' }}>{String(product.group || "-")}</td>
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
                          {Array.isArray(product.colors) 
                            ? product.colors.map(colorId => getColorName(colorId)).join(", ")
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
                              onClick={() => setEditProduct(product)}
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
    </div>
  );
}
