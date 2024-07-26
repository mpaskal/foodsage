import React, { lazy, Suspense, useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  ListGroup,
  Alert,
  Spinner,
  Button,
} from "react-bootstrap";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  FaTrash,
  FaDollarSign,
  FaBoxOpen,
  FaExclamationTriangle,
  FaHistory,
  FaChartLine,
} from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { getCurrentDateFormatted } from "../../utils/dateUtils";
import { useDashboard } from "../../hooks/useDashboard";
import ActionNeededModal from "../../components/Dashboard/ActionNeededModal";
import { recentActivityState } from "../../recoil/foodItemsAtoms";
import { loggedInUserState } from "../../recoil/userAtoms";

const Layout = lazy(() => import("../../components/Layout/LayoutApp"));

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    wasteAtGlance,
    moneyMatters,
    inventoryStatus,
    actionNeeded,
  } = useDashboard();
  const currentDate = getCurrentDateFormatted();

  const recentActivity = useRecoilValue(recentActivityState);
  const loggedInUser = useRecoilValue(loggedInUserState);
  const [filteredRecentActivity, setFilteredRecentActivity] = useState([]);

  useEffect(() => {
    console.log("Recent Activity:", recentActivity);
    console.log("Logged In User:", loggedInUser);

    if (Array.isArray(recentActivity)) {
      const filtered = recentActivity.filter(
        (activity) => activity.tenantId === loggedInUser.tenantId
      );
      setFilteredRecentActivity(filtered);
    } else {
      console.error("recentActivity is not an array:", recentActivity);
      setFilteredRecentActivity([]);
    }
  }, [recentActivity, loggedInUser]);

  const [showActionModal, setShowActionModal] = useState(false);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

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
      onClick: () => navigate("/savings"),
    },
    {
      title: "Actions Needed",
      value:
        actionNeeded.expiredItemsCount +
        actionNeeded.donationItemsNotMarkedCount,
      icon: FaExclamationTriangle,
      color: "#36A2EB",
      onClick: () => setShowActionModal(true),
    },
  ];

  const wasteData = {
    labels: ["Wasted", "Saved"],
    datasets: [
      {
        data: [
          wasteAtGlance.totalWastedThisMonth,
          100 - wasteAtGlance.totalWastedThisMonth,
        ],
        backgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  const moneyData = {
    labels: ["Money Lost", "Potential Savings"],
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
      <div className="container py-4">
        <h1 className="mb-4">Dashboard</h1>
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
                    <Card.Title className="mb-0 fs-6">{card.title}</Card.Title>
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
                  "Items to Mark as Donated" are items set for donation but not
                  yet confirmed as donated. Please update their status if they
                  have been donated.
                </small>
                <Button
                  variant="outline-primary"
                  onClick={() => setShowActionModal(true)}
                  className="w-100"
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Card.Title>
                  <FaHistory /> Recent Activity
                </Card.Title>
                <ListGroup>
                  {filteredRecentActivity.length > 0 ? (
                    filteredRecentActivity.map((activity, index) => (
                      <ListGroup.Item key={index}>
                        {activity.user} {activity.action} {activity.itemName} on{" "}
                        {activity.date}
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>No recent activity</ListGroup.Item>
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      <ActionNeededModal
        show={showActionModal}
        onHide={() => setShowActionModal(false)}
        expiredCount={actionNeeded.expiredItemsCount}
        donationCount={actionNeeded.donationItemsNotMarkedCount}
      />
    </Layout>
  );
};

export default DashboardPage;
