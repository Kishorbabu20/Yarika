import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const AddEditSizeGroupModal = ({
  isOpen,
  onRequestClose,
  onSubmit,
  initialGroup = {},
  allSizes = [],
  mode = "add"
}) => {
  const [name, setName] = useState("");
  const [selectedSizes, setSelectedSizes] = useState([]);

  useEffect(() => {
    if (initialGroup) {
      setName(initialGroup.name || "");
      setSelectedSizes(initialGroup.sizes ? initialGroup.sizes.map(s => s.name) : []);
    } else {
      setName("");
      setSelectedSizes([]);
    }
  }, [initialGroup, isOpen]);

  const handleToggleSize = (sizeName) => {
    setSelectedSizes(selectedSizes.includes(sizeName)
      ? selectedSizes.filter(s => s !== sizeName)
      : [...selectedSizes, sizeName]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const groupSizes = allSizes.filter(s => selectedSizes.includes(s.name));
    onSubmit({ name, sizes: groupSizes });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={mode === "add" ? "Add Size Group" : "Edit Size Group"}
      ariaHideApp={false}
      style={{
        overlay: {
          zIndex: 1000,
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        content: {
          maxWidth: 420,
          margin: 0,
          borderRadius: 12,
          padding: "12px 24px",
          boxShadow: "0 2px 24px rgba(0,0,0,0.08)",
          position: "relative",
          inset: "unset",
          height: "auto",
          minHeight: "unset"
        }
      }}
    >
      <h2 style={{ marginBottom: 18 }}>{mode === "add" ? "Add Size Group" : "Edit Size Group"}</h2>
      <form onSubmit={handleSubmit} style={{ margin: 0 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500 }}>Group Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>Select Sizes</label>
          <div style={{ background: '#fff', border: '1.5px solid #eee', borderRadius: 10, padding: 18, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {allSizes.map((size, idx) => (
              <label key={size._id || size.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size.name)}
                  onChange={() => handleToggleSize(size.name)}
                  style={{
                    accentColor: selectedSizes.includes(size.name) ? '#caa75d' : '#eee',
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: '2px solid #caa75d',
                    marginRight: 6,
                    cursor: 'pointer'
                  }}
                />
                {size.name}
              </label>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8, marginBottom: 0, paddingBottom: 0 }}>
          <button
            type="button"
            onClick={onRequestClose}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#eee',
              color: '#333',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: "#caa75d",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 8,
              border: "none",
              fontSize: 16,
              padding: "10px 0",
              minWidth: 160,
              cursor: "pointer"
            }}
          >
            {mode === "add" ? "Add Group" : "Update Group"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditSizeGroupModal; 