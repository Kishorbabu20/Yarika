import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import api from "../config/axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import '../styles/NewMember.css';
import toast from "react-hot-toast";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [newMember, setNewMember] = useState({
    name: "", email: "", password: "", role: "Admin"
  });
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Load members on mount
  useEffect(() => {
    api.get("/admins")
      .then(res => {
        // Defensive: only set array
        setMembers(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => toast.error("Failed to load members"));
  }, []);

  const fetchMembers = async () => {
    const res = await api.get("/members");
    setMembers(res.data.filter(m => m.status === "Active"));
  };

  // Add member
  const handleAddMember = async () => {
    const { name, email, password, role } = newMember;
    if (!name || !email || !password || !role) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await api.post("/admins/add", {
        ...newMember,
        username: newMember.email // Use email as username
      });
      console.log("Add member response:", res.data);
      setMembers(prev => [...prev, res.data]); // Only runs if successful
      setShowForm(false);
      setNewMember({ name: "", email: "", password: "", role: "Admin" });
      toast.custom((t) => (
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 0 0 1.5px #e5e5e5",
            padding: "20px 28px 18px 24px",
            minWidth: 340,
            maxWidth: 400,
            fontFamily: "inherit",
            color: "#181818",
            border: "1.5px solid #e5e5e5",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            position: "relative"
          }}
        >
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              background: "none",
              border: "none",
              fontSize: 18,
              color: "#888",
              cursor: "pointer"
            }}
            aria-label="Close"
          >
            ×
          </button>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 2 }}>
            Admin Added Successfully
          </div>
          <div style={{ fontSize: 16, color: "#444" }}>
            The new admin member has been added successfully.
          </div>
        </div>
      ));
    } catch (err) {
      console.error("Add member error:", err);
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleDelete = async (memberId) => {
    try {
      await api.delete(`/admins/${memberId}`);
      setMembers(prev => prev.filter(m => m._id !== memberId)); // Remove from state immediately
      toast.success("Member removed!");
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  // Filter members by search
  const filteredMembers = members.filter(m =>
    (m.name ? m.name.toLowerCase() : "").includes(search.toLowerCase()) ||
    (m.email ? m.email.toLowerCase() : "").includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
        <div className="main-content">
        <Header title="Members" />
        <ChangePasswordModal isOpen={showChangePassword} onRequestClose={() => setShowChangePassword(false)} />
        
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: 0 }}>
        {/* Main content with horizontal spacing */}
            <div style={{ padding: '0 32px' }}>
          <div className="admin-members-section-row" style={{ marginBottom: 0 }}>
            <div>
              <div className="admin-members-title" style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Admin Members</div>
              <div className="admin-members-subtitle" style={{ fontSize: 18, color: '#444', marginBottom: 0 }}>Manage Admin Accounts And Permissions</div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              style={{ background: '#c6aa62', color: '#fff', fontWeight: 600, fontSize: 16, borderRadius: 8, padding: '10px 22px', border: '1.5px solid #c6aa62' }}
            >
              + invite member
            </Button>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: 24, margin: '32px 0 24px 0' }}>
            {[
              { label: 'Total Members', value: members.filter(m => m.status === 'Active').length },
              { label: 'Active Members', value: members.filter(m => m.status === 'Active').length },
              { label: 'Super Admin', value: members.filter(m => m.role === 'Super Admin' && m.status === 'Active').length },
              { label: 'Admin', value: members.filter(m => m.role === 'Admin' && m.status === 'Active').length },
            ].map((card, i) => (
              <div key={card.label} style={{ flex: 1, border: '2px solid #e5d7b8', borderRadius: 12, background: '#fff', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 8 }}>
                  <rect x="2" y="4" width="20" height="16" rx="4" stroke="#c6aa62" strokeWidth="2"/>
                  <circle cx="8" cy="12" r="2" stroke="#c6aa62" strokeWidth="2"/>
                  <circle cx="16" cy="12" r="2" stroke="#c6aa62" strokeWidth="2"/>
                </svg>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#222', marginBottom: 2 }}>{card.value}</div>
                <div style={{ fontSize: 15, color: '#444', fontWeight: 500 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="yarika-card overflow-x-auto" style={{ marginBottom: 32 }}>
            <table className="members-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL ID</th>
                  <th>ROLE</th>
                  <th>ADDED ON</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filteredMembers) && filteredMembers
                  .filter(m => m.status === "Active")
                  .map((m, idx) => (
                  <tr key={m._id || idx}>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>
                      <span className={`role-badge ${m.role === "Super Admin" ? "role-superadmin" : "role-admin"}`}>{m.role}</span>
                    </td>
                    <td>{m.addedOn}</td>
                    <td>
                      <span className={`status-badge ${m.status === "Active" ? "status-active" : "status-removed"}`}>{m.status}</span>
                    </td>
                    <td>
                      {m.status === "Active" && m.role !== "Super Admin" ? (
                          <button className="remove-badge" onClick={() => handleDelete(m._id)}>Remove</button>
                      ) : <span className="ellipsis">...</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Permissions Section */}
          <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
            <div style={{ flex: 1, border: '2px solid #e5d7b8', borderRadius: 12, background: '#fff', padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#181818' }}>Super Admin</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#222', fontSize: 16, lineHeight: 1.7 }}>
                <li>Full System Access</li>
                <li>Manage All Users</li>
                <li>System Configuration</li>
                <li>Delete Any Content</li>
              </ul>
            </div>
            <div style={{ flex: 1, border: '2px solid #e5d7b8', borderRadius: 12, background: '#fff', padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#181818' }}>Admin</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#222', fontSize: 16, lineHeight: 1.7 }}>
                <li>Manage Products</li>
                <li>View Analytics</li>
                <li>Manage Orders</li>
                <li>Limited User Management</li>
              </ul>
            </div>
          </div>

          {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2">Add New Member</h3>
                <p className="mb-4 text-gray-500">Create A New Admin Account</p>

                <form onSubmit={e => { e.preventDefault(); handleAddMember(); }}>
                <div className="space-y-4">
                  <Input type="text" placeholder="Full name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
                  <Input type="email" placeholder="Email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
                  <Input type="password" placeholder="Password" value={newMember.password} onChange={(e) => setNewMember({ ...newMember, password: e.target.value })} />
                  <select className="w-full border rounded p-2" value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                  <div className="flex gap-2">
                      <Button type="submit">Add Member</Button>
                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </div>
                </form>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
    </div>
  );
}