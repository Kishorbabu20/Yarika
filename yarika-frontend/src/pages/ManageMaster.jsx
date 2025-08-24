import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Button } from "../components/ui/Button";
import AddEditColorModal from "../components/forms/AddEditColorModal";
import AddEditSizeModal from "../components/forms/AddEditSizeModal";
import AddEditColorGroupModal from "../components/forms/AddEditColorGroupModal";
import AddEditSizeGroupModal from "../components/forms/AddEditSizeGroupModal";
import axios from "../config/axios";
import "../styles/ManageMaster.css";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import { Eye, Download, Pencil, Trash2, X } from "lucide-react";

const TABS = ["Colors", "Sizes", "Color Grouping", "Group Size", "Batch & Products"];

export default function ManageMaster() {
  const [activeTab, setActiveTab] = useState("Colors");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");

  // Data state
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colorGroups, setColorGroups] = useState([]);
  const [sizeGroups, setSizeGroups] = useState([]);
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [showColorModal, setShowColorModal] = useState(false);
  const [colorModalMode, setColorModalMode] = useState("add");
  const [colorToEdit, setColorToEdit] = useState(null);

  const [showSizeModal, setShowSizeModal] = useState(false);
  const [sizeModalMode, setSizeModalMode] = useState("add");
  const [sizeToEdit, setSizeToEdit] = useState(null);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState("add");
  const [groupToEdit, setGroupToEdit] = useState(null);

  const [showSizeGroupModal, setShowSizeGroupModal] = useState(false);
  const [sizeGroupModalMode, setSizeGroupModalMode] = useState("add");
  const [sizeGroupToEdit, setSizeGroupToEdit] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [colorRes, sizeRes, groupRes] = await Promise.all([
          axios.get("/colors"),
          axios.get("/sizes"),
          axios.get("/color-groups")
        ]);
        setColors(colorRes.data);
        setSizes(sizeRes.data);
        setColorGroups(groupRes.data);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Fetch size groups on mount
  useEffect(() => {
    const fetchSizeGroups = async () => {
      try {
        const res = await axios.get("/size-groups");
        setSizeGroups(res.data);
      } catch (err) {
        // Optionally set error
      }
    };
    fetchSizeGroups();
  }, []);

  const [batchProducts, setBatchProducts] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    if (activeTab === "Batch & Products") {
      setBatchLoading(true);
      setBatchError("");
      axios.get("/batch-products")
        .then(res => setBatchProducts(res.data))
        .catch(err => setBatchError("Failed to load batch products"))
        .finally(() => setBatchLoading(false));
    }
  }, [activeTab]);

  // Color CRUD
  const handleAddColor = () => {
    setColorModalMode("add");
    setColorToEdit(null);
    setShowColorModal(true);
  };
  const handleEditColor = (color) => {
    setColorModalMode("edit");
    setColorToEdit(color);
    setShowColorModal(true);
  };
  const handleColorModalSubmit = async (color) => {
    setLoading(true);
    setError("");
    try {
      if (colorModalMode === "add") {
        const res = await axios.post("/colors", color);
        setColors([res.data, ...colors]);
      } else if (colorModalMode === "edit") {
        const res = await axios.put(`/colors/${colorToEdit._id}`, color);
        setColors(colors.map(c => c._id === colorToEdit._id ? res.data : c));
      }
      setShowColorModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save color");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteColor = async (id) => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`/colors/${id}`);
      setColors(colors.filter(c => c._id !== id));
    } catch (err) {
      setError("Failed to delete color");
    } finally {
      setLoading(false);
    }
  };

  // Size CRUD
  const handleAddSize = () => {
    setSizeModalMode("add");
    setSizeToEdit(null);
    setShowSizeModal(true);
  };
  const handleEditSize = (size) => {
    setSizeModalMode("edit");
    setSizeToEdit(size);
    setShowSizeModal(true);
  };
  const handleSizeModalSubmit = async (size) => {
    setLoading(true);
    setError("");
    try {
      if (sizeModalMode === "add") {
        const res = await axios.post("/sizes", size);
        setSizes([res.data, ...sizes]);
      } else if (sizeModalMode === "edit") {
        const res = await axios.put(`/sizes/${sizeToEdit._id}`, size);
        setSizes(sizes.map(s => s._id === sizeToEdit._id ? res.data : s));
      }
      setShowSizeModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save size");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteSize = async (id) => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`/sizes/${id}`);
      setSizes(sizes.filter(s => s._id !== id));
    } catch (err) {
      setError("Failed to delete size");
    } finally {
      setLoading(false);
    }
  };

  // Color Group CRUD
  const handleAddGroup = () => {
    setGroupModalMode("add");
    setGroupToEdit(null);
    setShowGroupModal(true);
  };
  const handleEditGroup = (group) => {
    setGroupModalMode("edit");
    setGroupToEdit(group);
    setShowGroupModal(true);
  };
  const handleGroupModalSubmit = async (group) => {
    setLoading(true);
    setError("");
    try {
      if (groupModalMode === "add") {
        const res = await axios.post("/color-groups", group);
        setColorGroups([res.data, ...colorGroups]);
      } else if (groupModalMode === "edit") {
        const res = await axios.put(`/color-groups/${groupToEdit._id}`, group);
        setColorGroups(colorGroups.map(g => g._id === groupToEdit._id ? res.data : g));
      }
      setShowGroupModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save group");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteGroup = async (id) => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`/color-groups/${id}`);
      setColorGroups(colorGroups.filter(g => g._id !== id));
    } catch (err) {
      setError("Failed to delete group");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSizeGroup = () => {
    setSizeGroupModalMode("add");
    setSizeGroupToEdit(null);
    setShowSizeGroupModal(true);
  };
  const handleEditSizeGroup = (group) => {
    setSizeGroupModalMode("edit");
    setSizeGroupToEdit(group);
    setShowSizeGroupModal(true);
  };
  const handleSizeGroupModalSubmit = async (group) => {
    setLoading(true);
    setError("");
    try {
      if (sizeGroupModalMode === "add") {
        const res = await axios.post("/size-groups", group);
        setSizeGroups([res.data, ...sizeGroups]);
      } else if (sizeGroupModalMode === "edit") {
        const res = await axios.put(`/size-groups/${sizeGroupToEdit._id}`, group);
        setSizeGroups(sizeGroups.map(g => g._id === sizeGroupToEdit._id ? res.data : g));
      }
      setShowSizeGroupModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save size group");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteSizeGroup = async (id) => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`/size-groups/${id}`);
      setSizeGroups(sizeGroups.filter(g => g._id !== id));
    } catch (err) {
      setError("Failed to delete size group");
    } finally {
      setLoading(false);
    }
  };

  function handleViewDetails(item) {
    setSelectedBatch(item);
  }

  const labelRef = useRef();

  function handleDownloadLabel(item) {
    setSelectedBatch(item);
    setTimeout(() => {
      if (labelRef.current) {
        html2canvas(labelRef.current, { backgroundColor: '#fff', scale: 2 }).then(canvas => {
          const link = document.createElement("a");
          link.download = `${item.serialNo}-label.png`;
          link.href = canvas.toDataURL();
          link.click();
        });
      }
    }, 200); // Wait for modal to render
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header title="Manage Master" />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <h1 className="manage-master-title" style={{ margin: '32px 0 0 0' }}>Manage Master</h1>
          <div className="manage-master-subtitle" style={{ margin: '8px 0 24px 0' }}>
            Manage colors, sizes, and color groupings for your inventory
          </div>
          {/* Tabs */}
          <div className="manage-master-tabs" style={{ margin: '32px 0 0 0' }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`manage-master-tab${activeTab === tab ? " active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Manage Colors Section */}
          {activeTab === "Colors" && (
            <div className="manage-master-card" style={{ margin: '32px 0 0 0' }}>
              <div className="manage-master-section-title">Manage Colors</div>
              <div className="manage-master-bar">
                <div className="search-input-wrapper" style={{ position: 'relative', flex: 1 }}>
                  <svg
                    className="search-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#bdbdbd',
                      pointerEvents: 'none'
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2"/>
                    <line x1="14.5" y1="14.5" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search Colors..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
                <div className="manage-master-bar-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <button className="gold-btn" onClick={handleAddColor}>+ Add New Product</button>
                  <select className="status-dropdown" value={status} onChange={e => setStatus(e.target.value)}>
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="manage-master-table-wrapper">
                <table className="manage-master-table">
                  <thead>
                    <tr>
                      <th>Date Added</th>
                      <th>Color Name</th>
                      <th>Color Code</th>
                      <th>Color Preview</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colors.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((color, idx) => (
                      <tr key={idx}>
                        <td>{color.createdAt ? new Date(color.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : ''}</td>
                        <td>{color.name}</td>
                        <td>{color.code}</td>
                        <td>
                          <span className="color-dot" style={{ background: color.code }} />
                        </td>
                        <td>
                          <span className="status-toggle">
                            <span style={{
                              position: "relative",
                              display: "inline-block",
                              width: 28,
                              height: 16,
                              margin: 0
                            }}>
                              <input
                                type="checkbox"
                                checked={color.status}
                                readOnly
                                className="status-switch"
                                style={{
                                  opacity: 0,
                                  width: 28,
                                  height: 16,
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  margin: 0,
                                  cursor: "pointer"
                                }}
                              />
                              <span
                                style={{
                                  display: "block",
                                  width: 28,
                                  height: 16,
                                  background: color.status ? "#deb33f" : "#eee",
                                  borderRadius: 999,
                                  transition: "background 0.2s"
                                }}
                              />
                              <span
                                style={{
                                  position: "absolute",
                                  top: 2,
                                  left: color.status ? 14 : 2,
                                  width: 12,
                                  height: 12,
                                  background: "#fff",
                                  borderRadius: "50%",
                                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                  transition: "left 0.2s"
                                }}
                              />
                            </span>
                            <span className={`status-label${color.status ? '' : ' inactive'}`}>{color.status ? 'Active' : 'Inactive'}</span>
                          </span>
                        </td>
                        <td>
                          <span className="action-icons">
                            <button className="action-edit" onClick={() => handleEditColor(color)}><Pencil size={16} /></button>
                            <button className="action-delete" onClick={() => handleDeleteColor(color._id)}><Trash2 size={16} /></button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AddEditColorModal
                isOpen={showColorModal}
                onRequestClose={() => setShowColorModal(false)}
                onSubmit={handleColorModalSubmit}
                initialColor={colorToEdit}
                mode={colorModalMode}
              />
            </div>
          )}
          {/* Manage Sizes Section */}
          {activeTab === "Sizes" && (
            <div className="manage-master-card" style={{ margin: '32px 0 0 0' }}>
              <div className="manage-master-section-title">Manage Sizes</div>
              <div className="manage-master-bar">
                <div className="search-input-wrapper" style={{ position: 'relative', flex: 1 }}>
                  <svg
                    className="search-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#bdbdbd',
                      pointerEvents: 'none'
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2"/>
                    <line x1="14.5" y1="14.5" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search sizes..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
                <div className="manage-master-bar-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <button className="gold-btn" onClick={handleAddSize}>+ Add New Size</button>
                  <select className="status-dropdown" value={status} onChange={e => setStatus(e.target.value)}>
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="manage-master-table-wrapper">
                <table className="manage-master-table">
                  <thead>
                    <tr>
                      <th>Size Name</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) && (status === 'All Status' || (status === 'Active' ? s.status : !s.status))).map((size, idx) => (
                      <tr key={idx}>
                        <td>{size.name}</td>
                        <td>
                          <span className="status-toggle">
                            <span style={{
                              position: "relative",
                              display: "inline-block",
                              width: 28,
                              height: 16,
                              margin: 0
                            }}>
                              <input
                                type="checkbox"
                                checked={size.status}
                                readOnly
                                className="status-switch"
                                style={{
                                  opacity: 0,
                                  width: 28,
                                  height: 16,
                                  position: "absolute",
                                  left: 0,
                                  top: 0,
                                  margin: 0,
                                  cursor: "pointer"
                                }}
                              />
                              <span
                                style={{
                                  display: "block",
                                  width: 28,
                                  height: 16,
                                  background: size.status ? "#deb33f" : "#eee",
                                  borderRadius: 999,
                                  transition: "background 0.2s"
                                }}
                              />
                              <span
                                style={{
                                  position: "absolute",
                                  top: 2,
                                  left: size.status ? 14 : 2,
                                  width: 12,
                                  height: 12,
                                  background: "#fff",
                                  borderRadius: "50%",
                                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                  transition: "left 0.2s"
                                }}
                              />
                            </span>
                            <span className={`status-label${size.status ? '' : ' inactive'}`}>{size.status ? 'Active' : 'Inactive'}</span>
                          </span>
                        </td>
                        <td>
                          <span className="action-icons">
                            <button className="action-edit" onClick={() => handleEditSize(size)}><Pencil size={16} /></button>
                            <button className="action-delete" onClick={() => handleDeleteSize(size._id)}><Trash2 size={16} /></button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AddEditSizeModal
                isOpen={showSizeModal}
                onRequestClose={() => setShowSizeModal(false)}
                onSubmit={handleSizeModalSubmit}
                initialSize={sizeToEdit}
                mode={sizeModalMode}
              />
            </div>
          )}
          {/* Manage Color Grouping Section */}
          {activeTab === "Color Grouping" && (
            <div className="manage-master-card" style={{ margin: '32px 0 0 0' }}>
              <div className="manage-master-section-title">Manage Color Grouping</div>
              <div className="manage-master-bar">
                <div className="search-input-wrapper" style={{ position: 'relative', flex: 1 }}>
                  <svg
                    className="search-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#bdbdbd',
                      pointerEvents: 'none'
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2"/>
                    <line x1="14.5" y1="14.5" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
                <button className="gold-btn" style={{ whiteSpace: 'nowrap', minWidth: 140, fontSize: '0.95rem', padding: '8px 0' }} onClick={handleAddGroup}>+ Add New Group</button>
              </div>
              <div className="manage-master-table-wrapper">
                <table className="manage-master-table">
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Colors in Group</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colorGroups.filter(g => g.name.toLowerCase().includes(search.toLowerCase())).map((group, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{group.name}</td>
                        <td>
                          <span style={{ display: 'flex', gap: 16 }}>
                            {group.colors.map((color, cidx) => (
                              <span key={cidx} className="color-chip">
                                <span className="color-dot" style={{ background: color.code }} />
                                <span className="color-label">{color.name}</span>
                              </span>
                            ))}
                          </span>
                        </td>
                        <td>
                          <span className="action-icons">
                            <button className="action-edit" onClick={() => handleEditGroup(group)}><Pencil size={16} /></button>
                            <button className="action-delete" onClick={() => handleDeleteGroup(group._id)}><Trash2 size={16} /></button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AddEditColorGroupModal
                isOpen={showGroupModal}
                onRequestClose={() => setShowGroupModal(false)}
                onSubmit={handleGroupModalSubmit}
                initialGroup={groupToEdit}
                allColors={colors}
                mode={groupModalMode}
              />
            </div>
          )}
          {/* Manage Group Size Section */}
          {activeTab === "Group Size" && (
            <div className="manage-master-card" style={{ margin: '32px 0 0 0' }}>
              <div className="manage-master-section-title">Manage Group Size</div>
              <div className="manage-master-bar">
                <div style={{ flex: 1 }} />
                <button className="gold-btn" onClick={handleAddSizeGroup}>+ Add New Group Size</button>
              </div>
              <div className="manage-master-table-wrapper">
                <table className="manage-master-table">
                  <thead>
                    <tr>
                      <th>Group Name</th>
                      <th>Sizes in Group</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeGroups.map((group, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{group.name}</td>
                        <td>
                          <span style={{ display: 'flex', gap: 16 }}>
                            {group.sizes.map((size, sidx) => (
                              <span key={sidx} className="color-label">{size.name}</span>
                            ))}
                          </span>
                        </td>
                        <td>
                          <span className="action-icons">
                            <button className="action-edit" onClick={() => handleEditSizeGroup(group)}><Pencil size={16} /></button>
                            <button className="action-delete" onClick={() => handleDeleteSizeGroup(group._id)}><Trash2 size={16} /></button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AddEditSizeGroupModal
                isOpen={showSizeGroupModal}
                onRequestClose={() => setShowSizeGroupModal(false)}
                onSubmit={handleSizeGroupModalSubmit}
                initialGroup={sizeGroupToEdit}
                allSizes={sizes}
                mode={sizeGroupModalMode}
              />
            </div>
          )}
          {activeTab === "Batch & Products" && (
            <div className="manage-master-card" style={{ margin: '32px 0 0 0' }}>
              <div className="manage-master-section-title">Batch & Products</div>
              <div className="manage-master-table-wrapper">
                <table className="manage-master-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Serial No</th>
                      <th>By</th>
                      <th>Sold Status</th>
                      <th>Sold To</th>
                      <th>Returned</th>
                      <th>Size</th>
                      <th>Color</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchProducts.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{item.date}</td>
                        <td>
                          <span style={{ display: "block" }}>{item.name}</span>
                        </td>
                        <td>{item.serialNo}</td>
                        <td>{item.by}</td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span role="img" aria-label={item.soldStatus}>{item.soldStatus === "Unsold" ? "🚫" : "✅"}</span> {item.soldStatus}
                          </span>
                        </td>
                        <td>{item.soldTo || "-- --"}</td>
                        <td>{item.returned}</td>
                        <td>{item.size}</td>
                        <td>
                          <span>
                            {item.color.name}
                            <span className="color-dot" style={{ background: item.color.code }} />
                          </span>
                        </td>
                        <td>
                          <span className={item.status === "Active" ? "status-active" : "status-inactive"}>
                            {item.status}
                          </span>
                        </td>
                        <td className="action-col">
                          <button className="action-btn" title="View" onClick={() => handleViewDetails(item)}>
                            <Eye size={18} />
                          </button>
                          <button className="action-btn" title="Download" onClick={() => handleDownloadLabel(item)}>
                            <Download size={18} color="#deb33f" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedBatch && (
        <div className="modal-overlay">
          <div className="modal-content label-modal" ref={labelRef}>
            <button onClick={() => setSelectedBatch(null)}><X size={18} /></button>
            <hr className="label-hr" />
            <div className="label-title">{selectedBatch.name?.toUpperCase()}</div>
            <hr className="label-hr" />
            <div className="label-main-row">
              <div className="label-main-left">
                <div className="label-row-flex"><span>Size:</span><span>{selectedBatch.size}</span></div>
                <div className="label-row-flex"><span>Colour:</span><span>{selectedBatch.color?.name}</span></div>
                <div className="label-row-flex"><span>MRP:</span><span>₹{selectedBatch.mrp || "0.00"}</span></div>
              </div>
              <div className="label-main-right">
                <QRCodeCanvas value={selectedBatch.serialNo} size={80} />
                <div className="label-serial">{selectedBatch.serialNo}</div>
              </div>
            </div>
            <a className="label-footer" href="https://www.yarika.in" target="_blank" rel="noopener noreferrer">www.yarika.in</a>
          </div>
        </div>
      )}
    </div>
  );
} 