import React, { useState, lazy, Suspense } from "react";
import { useRecoilValue } from "recoil";
import {
  wasteAtGlanceSelector,
  moneyMattersSelector,
  inventoryStatusSelector,
  actionNeededSelector,
} from "../../recoil/foodItemsAtoms";
import { loggedInUserState } from "../../recoil/userAtoms";
import {
  Alert,
  Spinner,
  Container,
  Modal,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import useDashboardData from "../../hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
import ActionNeededModal from "../../components/Dashboard/ActionNeededModal";
import { Bar, Doughnut } from "react-chartjs-2";
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
  FaChartLine,
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
  const [showActionModal, setShowActionModal] = useState(false);
  const navigate = useNavigate();

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

  const summaryCards = [
    {
      title: "Total Active Items",
      value: inventoryStatus.totalActiveItems,
      icon: FaChartLine,
      color: "#4BC0C0",
      onClick: () => navigate("/fooditems"),
    },
    {
      title: "Wasted This Month",
      value: wasteAtGlance.totalWastedThisMonth,
      icon: FaTrash,
      color: "#FF6384",
      onClick: () => navigate("/wasteitems"),
    },
    {
      title: "Money Lost",
      value: `$${moneyMatters.moneyLostThisMonth.toFixed(2)}`,
      icon: FaDollarSign,
      color: "#FFCE56",
      onClick: () => navigate("/savingtracking"), // You'll need to create this route
    },
    {
      title: "Actions Needed",
      value:
        actionNeeded.expiredItemsCount +
        actionNeeded.donationItemsNotMarkedCount,
      icon: FaExclamationTriangle,
      color: "#36A2EB",
      onClick: () => setShowActionModal(true), // We'll create a modal for this
    },
  ];

  return (
    <Layout>
      <Suspense fallback={<Spinner animation="border" />}>
        <div className="container py-3">
          <h1 className="h3 mb-4">Dashboard Overview</h1>
          {user && (
            <Alert variant="info" className="mb-4">
              Welcome, {user.firstName}! Here are some insights to help you
              reduce food waste.
            </Alert>
          )}

          <Row className="g-3 mb-4">
            {summaryCards.map((card, index) => (
              <Col key={index} lg={3} md={6}>
                <Card
                  className="h-100 border-0 shadow-sm"
                  onClick={card.onClick}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body className="d-flex align-items-center">
                    <div
                      style={{
                        color: card.color,
                        fontSize: "2rem",
                        marginRight: "1rem",
                      }}
                    >
                      <card.icon />
                    </div>
                    <div>
                      <Card.Title className="mb-0 fs-6">
                        {card.title}
                      </Card.Title>
                      <div className="fs-4 fw-bold">{card.value}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-3">
            <Col lg={6} md={12} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <Card.Title className="d-flex align-items-center mb-3">
                    <FaTrash className="me-2" />
                    Waste at a Glance
                  </Card.Title>
                  <div style={{ height: "200px" }}>
                    <Doughnut
                      data={wasteData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <small>
                      Change: {wasteAtGlance.percentageChange.toFixed(2)}%
                    </small>
                    <p className="mb-0">
                      <small>{wasteAtGlance.quickTip}</small>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6} md={12} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <Card.Title className="d-flex align-items-center mb-3">
                    <FaDollarSign className="me-2" />
                    Money Matters
                  </Card.Title>
                  <div style={{ height: "200px" }}>
                    <Bar
                      data={moneyData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <small>
                      Lost: ${moneyMatters.moneyLostThisMonth.toFixed(2)}
                    </small>
                    <br />
                    <small>
                      Potential Savings: $
                      {moneyMatters.potentialSavings.toFixed(2)}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6} md={12} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <Card.Title className="d-flex align-items-center mb-3">
                    <FaBoxOpen className="me-2" />
                    Inventory Status
                  </Card.Title>
                  <div style={{ height: "200px" }}>
                    <Bar
                      data={inventoryData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <small>
                      Active Items: {inventoryStatus.totalActiveItems}
                    </small>
                    <br />
                    <small>
                      Expiring Soon: {inventoryStatus.itemsExpiringInThreeDays}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6} md={12} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <Card.Title className="d-flex align-items-center mb-3">
                    <FaExclamationTriangle className="me-2 text-warning" />
                    Action Needed
                  </Card.Title>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>Expired Items:</strong>{" "}
                      {actionNeeded.expiredItemsCount}
                    </li>
                    <li className="mb-2">
                      <strong>Items to Mark as Donated:</strong>{" "}
                      {actionNeeded.donationItemsNotMarkedCount}
                    </li>
                  </ul>
                  <small className="text-muted d-block mb-3">
                    "Items to Mark as Donated" are items set for donation but
                    not yet confirmed as donated. Please update their status if
                    they have been donated.
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Suspense>
      <ActionNeededModal
        show={showActionModal}
        onHide={() => setShowActionModal(false)}
        expiredCount={actionNeeded.expiredItemsCount}
        donationCount={actionNeeded.donationItemsNotMarkedCount}
      />
    </Layout>
  );
};

export default DashboardOverview;
