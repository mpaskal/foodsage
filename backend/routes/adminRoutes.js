import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import TenantManagementPage from "../pages/TenantManagementPage";
import UserManagementPage from "../pages/UserManagementPage";
// Import other admin pages similarly

const AdminRoutes = () => (
  <Router>
    <Switch>
      <Route path="/admin/tenant-management" component={TenantManagementPage} />
      <Route path="/admin" component={UserManagementPage} />
      {/* Define other admin routes similarly */}
    </Switch>
  </Router>
);

export default AdminRoutes;
