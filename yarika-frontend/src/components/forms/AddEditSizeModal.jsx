import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const AddEditSizeModal = ({
  isOpen,
  onRequestClose,
  onSubmit,
  initialSize = {},
  mode = "add"
}) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (initialSize) {
      setName(initialSize.name || "");
      setStatus(initialSize.status !== undefined ? initialSize.status : true);
    } else {
      setName("");
      setStatus(true);
    }
  }, [initialSize, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, status });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={mode === "add" ? "Add Size" : "Edit Size"}
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
      <h2 style={{ marginBottom: 18 }}>{mode === "add" ? "Add Size" : "Edit Size"}</h2>
      <form onSubmit={handleSubmit} style={{ margin: 0 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500 }}>Size Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc", marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500, marginRight: 18 }}>Status</label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: status ? "#bdbdbd" : "#deb33f", fontWeight: 500, fontSize: 15 }}>Inactive</span>
            <span style={{ position: "relative", display: "inline-block", width: 44, height: 24, margin: "0 8px" }}>
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
                  background: status ? "#deb33f" : "#eee",
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
            <span style={{ color: status ? "#deb33f" : "#bdbdbd", fontWeight: 500, fontSize: 15 }}>Active</span>
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
              background: "#deb33f",
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
            {mode === "add" ? "Add Size" : "Update Size"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditSizeModal; 