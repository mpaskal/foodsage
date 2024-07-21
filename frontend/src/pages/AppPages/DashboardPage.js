import React, { lazy } from "react";
import { useRecoilValue } from "recoil";
import {
  wasteAtGlanceSelector,
  moneyMattersSelector,
  inventoryStatusSelector,
  actionNeededSelector,
} from "../../recoil/foodItemsAtoms";
import { loggedInUserState } from "../../recoil/userAtoms";
import { Alert, Spinner } from "react-bootstrap";
import useDashboardData from "../../hooks/useDashboardData";

const Layout = lazy(() => import("../../components/Layout/LayoutApp"));
const DashboardOverview = () => {
  const { error, isLoading } = useDashboardData();
  const wasteAtGlance = useRecoilValue(wasteAtGlanceSelector);
  const moneyMatters = useRecoilValue(moneyMattersSelector);
  const inventoryStatus = useRecoilValue(inventoryStatusSelector);
  const actionNeeded = useRecoilValue(actionNeededSelector);
  const user = useRecoilValue(loggedInUserState);

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Layout>
      <div className="container">
        <h1 className="mb-4">Dashboard Overview</h1>
        {user && (
          <Alert variant="info" className="mb-4">
            Welcome, {user.firstName}! Here are some insights to help you reduce
            food waste.
          </Alert>
        )}
        <section className="waste-at-glance">
          <h3>Waste at a Glance</h3>
          <p>Total wasted this month: {wasteAtGlance.totalWastedThisMonth}</p>
          <p>
            Percentage change from last month:{" "}
            {wasteAtGlance.percentageChange.toFixed(2)}%
          </p>
          <p>Quick tip: {wasteAtGlance.quickTip}</p>
        </section>

        <section className="money-matters">
          <h3>Money Matters</h3>
          <p>
            Money lost due to waste this month: $
            {moneyMatters.moneyLostThisMonth.toFixed(2)}
          </p>
          <p>Potential savings: ${moneyMatters.potentialSavings.toFixed(2)}</p>
        </section>

        <section className="inventory-status">
          <h3>Current Inventory Status</h3>
          <p>Total active food items: {inventoryStatus.totalActiveItems}</p>
          <p>
            Items expiring in the next 3 days:{" "}
            {inventoryStatus.itemsExpiringInThreeDays}
          </p>
        </section>

        <section className="action-needed">
          <h3>Action Needed</h3>
          <p>
            Expired items requiring attention: {actionNeeded.expiredItemsCount}
          </p>
          <p>
            Donation items not marked as "Donated" for over 3 days:{" "}
            {actionNeeded.donationItemsNotMarkedCount}
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default DashboardOverview;
