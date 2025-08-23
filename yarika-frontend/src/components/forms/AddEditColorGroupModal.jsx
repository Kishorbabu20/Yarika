import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const AddEditColorGroupModal = ({
  isOpen,
  onRequestClose,
  onSubmit,
  initialGroup = {},
  allColors = [],
  mode = "add"
}) => {
  const [name, setName] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);

  useEffect(() => {
    if (initialGroup) {
      setName(initialGroup.name || "");
      setSelectedColors(initialGroup.colors ? initialGroup.colors.map(c => c.code) : []);
    } else {
      setName("");
      setSelectedColors([]);
    }
  }, [initialGroup, isOpen]);

  const handleToggleColor = (code) => {
    setSelectedColors(selectedColors.includes(code)
      ? selectedColors.filter(c => c !== code)
      : [...selectedColors, code]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const groupColors = allColors.filter(c => selectedColors.includes(c.code));
    onSubmit({ name, colors: groupColors });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={mode === "add" ? "Add Color Group" : "Edit Color Group"}
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
          maxWidth: 540,
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
      <h2 style={{ marginBottom: 18 }}>{mode === "add" ? "Add Color Group" : "Edit Color Group"}</h2>
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
          <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>Select Colors</label>
          <div style={{ background: '#fff', border: '1.5px solid #eee', borderRadius: 10, padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {allColors.map((color, idx) => (
              <label key={color.code} style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color.code)}
                  onChange={() => handleToggleColor(color.code)}
                  style={{
                    accentColor: selectedColors.includes(color.code) ? '#deb33f' : '#eee',
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: '2px solid #deb33f',
                    marginRight: 6,
                    cursor: 'pointer'
                  }}
                />
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: color.code, display: 'inline-block', border: '1.5px solid #eee' }} />
                {color.name}
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
              background: "#deb33f",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 8,
              border: "none",
              fontSize: 16,
              padding: "10px 0",
              minWidth: 180,
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

export default AddEditColorGroupModal; 