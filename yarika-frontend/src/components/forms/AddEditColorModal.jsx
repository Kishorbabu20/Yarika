import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const AddEditColorModal = ({
  isOpen,
  onRequestClose,
  onSubmit,
  initialColor = {},
  mode = "add"
}) => {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (initialColor) {
      setName(initialColor.name || "");
      setHex(initialColor.code || "");
      setStatus(initialColor.status !== undefined ? initialColor.status : true);
    } else {
      setName("");
      setHex("");
      setStatus(true);
    }
  }, [initialColor, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, code: hex, status });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={mode === "add" ? "Add Color" : "Edit Color"}
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
      <h2 style={{ marginBottom: 18 }}>{mode === "add" ? "Add Color" : "Edit Color"}</h2>
      <form onSubmit={handleSubmit} style={{ margin: 0 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500 }}>Color Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 500 }}>Hex Code</label>
            <input
              type="text"
              value={hex}
              onChange={e => setHex(e.target.value)}
              required
              style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}
              placeholder="#000000"
            />
          </div>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1.5px solid #eee",
              background: hex,
              display: "inline-block",
              marginTop: 22
            }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500, marginRight: 18 }}>Status</label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: status ? "#bdbdbd" : "#caa75d", fontWeight: 500, fontSize: 15 }}>Inactive</span>
            <span style={{
              position: "relative",
              display: "inline-block",
              width: 44,
              height: 24,
              margin: "0 8px"
            }}>
              <input
                type="checkbox"
                checked={status}
                onChange={() => setStatus(s => !s)}
                style={{
                  opacity: 0,
                  width: 44,
                  height: 24,
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
                  width: 44,
                  height: 24,
                  background: status ? "#caa75d" : "#eee",
                  borderRadius: 999,
                  transition: "background 0.2s"
                }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: status ? 24 : 4,
                  width: 18,
                  height: 18,
                  background: "#fff",
                  borderRadius: "50%",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  transition: "left 0.2s"
                }}
              />
            </span>
            <span style={{ color: status ? "#caa75d" : "#bdbdbd", fontWeight: 500, fontSize: 15 }}>Active</span>
          </label>
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
            {mode === "add" ? "Add Color" : "Update Color"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditColorModal; 