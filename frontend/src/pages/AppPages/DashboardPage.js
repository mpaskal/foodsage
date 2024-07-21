import React, { lazy, Suspense } from "react";
import { useRecoilValue } from "recoil";
import {
  wasteAtGlanceSelector,
  moneyMattersSelector,
  inventoryStatusSelector,
  actionNeededSelector,
} from "../../recoil/foodItemsAtoms";
import { loggedInUserState } from "../../recoil/userAtoms";
import { Alert, Spinner, Container, Row, Col, Card } from "react-bootstrap";
import useDashboardData from "../../hooks/useDashboardData";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import {
  FaTrash,
  FaDollarSign,
  FaBoxOpen,
  FaExclamationTriangle,
} from "react-icons/fa";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const Layout = lazy(() => import("../../components/Layout/LayoutApp"));

const DashboardOverview = () => {
  const { error, isLoading } = useDashboardData();
  const wasteAtGlance = useRecoilValue(wasteAtGlanceSelector);
  const moneyMatters = useRecoilValue(moneyMattersSelector);
  const inventoryStatus = useRecoilValue(inventoryStatusSelector);
  const actionNeeded = useRecoilValue(actionNeededSelector);
  const user = useRecoilValue(loggedInUserState);

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  const wasteData = {
    labels: ["Wasted", "Saved"],
    datasets: [
      {
        data: [
          wasteAtGlance.totalWastedThisMonth,
          wasteAtGlance.totalSavedThisMonth,
        ],
        backgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  const moneyData = {
    labels: ["Lost", "Potential Savings"],
    datasets: [
      {
        label: "Amount ($)",
        data: [moneyMatters.moneyLostThisMonth, moneyMatters.potentialSavings],
        backgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  const inventoryData = {
    labels: ["Active", "Expiring Soon"],
    datasets: [
      {
        label: "Items",
        data: [
          inventoryStatus.totalActiveItems,
          inventoryStatus.itemsExpiringInThreeDays,
        ],
        backgroundColor: ["#4BC0C0", "#FFCE56"],
      },
    ],
  };

  return (
    <Layout>
      <Suspense fallback={<Spinner animation="border" />}>
        <div className="container">
          <h1 className="my-4">Dashboard Overview</h1>
          {user && (
            <Alert variant="info" className="mb-4">
              Welcome, {user.firstName}! Here are some insights to help you
              reduce food waste.
            </Alert>
          )}
          <Row>
            <Col lg={3} md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>
                    <FaTrash className="me-2" />
                    Waste at a Glance
                  </Card.Title>
                  <Doughnut data={wasteData} />
                  <Card.Text className="mt-3">
                    Change: {wasteAtGlance.percentageChange.toFixed(2)}%
                  </Card.Text>
                  <Card.Text>{wasteAtGlance.quickTip}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>
                    <FaDollarSign className="me-2" />
                    Money Matters
                  </Card.Title>
                  <Bar data={moneyData} />
                  <Card.Text className="mt-3">
                    Lost: ${moneyMatters.moneyLostThisMonth.toFixed(2)}
                  </Card.Text>
                  <Card.Text>
                    Potential Savings: $
                    {moneyMatters.potentialSavings.toFixed(2)}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>
                    <FaBoxOpen className="me-2" />
                    Inventory Status
                  </Card.Title>
                  <Bar data={inventoryData} />
                  <Card.Text className="mt-3">
                    Active Items: {inventoryStatus.totalActiveItems}
                  </Card.Text>
                  <Card.Text>
                    Expiring Soon: {inventoryStatus.itemsExpiringInThreeDays}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>
                    <FaExclamationTriangle className="me-2" />
                    Action Needed
                  </Card.Title>
                  <Card.Text>
                    Expired Items: {actionNeeded.expiredItemsCount}
                  </Card.Text>
                  <Card.Text>
                    Unmarked Donations:{" "}
                    {actionNeeded.donationItemsNotMarkedCount}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Suspense>
    </Layout>
  );
};

export default DashboardOverview;
