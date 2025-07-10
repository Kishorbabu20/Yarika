import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../config/axios";
import toast from "react-hot-toast";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await api.get("/api/client/all");
      setCustomers(res.data.data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Filter customers by search
  const filteredCustomers = customers.filter(customer =>
    (customer.firstName?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (customer.lastName?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (customer.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (customer.phoneNumber || "").includes(search)
  );

  return (
    <div className="customers-page">
      <AdminLayout title="">
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '0 40px 0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 80 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#222', margin: 0 }}>Customers</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: '100%' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 48 }}>
              <input
                type="text"
                placeholder="Search customers"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '10px 36px 10px 36px', borderRadius: 24, border: '1px solid #e5e5e5', background: '#faf9f6', fontSize: 16, width: 200, height: 40, boxSizing: 'border-box', display: 'flex', alignItems: 'center' }}
              />
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#b19049' }} size={18} />
            </div>
            <span style={{ color: '#b19049', fontSize: 22, marginRight: 8, cursor: 'pointer' }}>🔔</span>
            <span style={{ background: '#c6aa62', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, cursor: 'pointer' }} onClick={() => setShowChangePassword(true)}>👤</span>
          </div>
        </div>
        <ChangePasswordModal isOpen={showChangePassword} onRequestClose={() => setShowChangePassword(false)} />

        {/* Main content */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: 24, margin: '32px 0 24px 0' }}>
            {[
              { label: 'Total Customers', value: customers.length },
              { label: 'With Addresses', value: customers.filter(c => c.addresses?.length > 0).length },
              { label: 'New This Month', value: customers.filter(c => {
                const date = new Date(c.createdAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length },
            ].map((card, i) => (
              <div key={card.label} style={{ flex: 1, border: '2px solid #e5d7b8', borderRadius: 12, background: '#fff', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 8 }}>
                  <rect x="2" y="4" width="20" height="16" rx="4" stroke="#c6aa62" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4" stroke="#c6aa62" strokeWidth="2"/>
                </svg>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#222', marginBottom: 2 }}>{card.value}</div>
                <div style={{ fontSize: 15, color: '#444', fontWeight: 500 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Customers Table */}
          <div className="yarika-card overflow-x-auto" style={{ marginBottom: 32 }}>
            <table className="customers-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#faf9f6', borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>NAME</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>EMAIL</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>PHONE</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>ADDRESSES</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>JOINED ON</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>No customers found</td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <td style={{ padding: '16px 24px' }}>
                        {customer.firstName} {customer.lastName}
                      </td>
                      <td style={{ padding: '16px 24px' }}>{customer.email}</td>
                      <td style={{ padding: '16px 24px' }}>{customer.phoneNumber || '-'}</td>
                      <td style={{ padding: '16px 24px' }}>
                        {customer.addresses?.length ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ background: '#e5d7b8', color: '#8b7339', padding: '4px 8px', borderRadius: 4, fontSize: 14 }}>
                              {customer.addresses.length} address{customer.addresses.length !== 1 ? 'es' : ''}
                            </span>
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {new Date(customer.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </div>
  );
} 