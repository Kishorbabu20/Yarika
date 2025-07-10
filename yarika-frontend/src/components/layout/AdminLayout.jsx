import { useState } from 'react';
import Sidebar from '../../components/Sidebar';

const AdminLayout = ({ children, title, onAdd }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
