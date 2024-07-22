import React from "react";
import { useRecoilValue } from "recoil";
import { savingsTrackingSelector } from "../../recoil/foodItemsAtoms";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Bar, Doughnut } from "react-chartjs-2";
import { FaDollarSign, FaChartLine, FaListUl, FaRecycle } from "react-icons/fa";
import Layout from "../../components/Layout/LayoutApp";
import useSavingsData from "../../hooks/useSavingsData";

const SavingTrackingPage = () => {
  const { error, isLoading } = useSavingsData();
  const savingsData = useRecoilValue(savingsTrackingSelector);

  console.log("Savings data in SavingTrackingPage:", savingsData);

  if (isLoading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div>Error: {error}</div>
      </Layout>
    );
  }

  // Calculate waste reduction (percentage change from last month to this month)
  const wasteReduction =
    savingsData.lastMonthSavings !== 0
      ? (
          ((savingsData.thisMonthSavings - savingsData.lastMonthSavings) /
            savingsData.lastMonthSavings) *
          100
        ).toFixed(1)
      : "N/A";

  const monthlyData = {
    labels: ["Last Month", "This Month"],
    datasets: [
      {
        label: "Monthly Savings",
        data: [
          savingsData.lastMonthSavings || 0,
          savingsData.thisMonthSavings || 0,
        ],
        backgroundColor: ["#36A2EB", "#4BC0C0"],
      },
    ],
  };

  const savingBreakdownData = {
    labels: Object.keys(savingsData.savingsByCategory || {}),
    datasets: [
      {
        data: Object.values(savingsData.savingsByCategory || {}),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  return (
    <Layout>
      <Container className="py-4">
        <h1 className="mb-4">Saving Tracking</h1>
        <p className="lead mb-4">
          Track your savings from reduced food waste, smart shopping, and
          efficient use of items.
        </p>

        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <Card.Title className="d-flex align-items-center mb-3">
                  <FaDollarSign className="me-2 text-primary" />
                  Total Savings
                </Card.Title>
                <h2 className="text-center text-success">
                  ${savingsData.totalSavings?.toFixed(2) || "0.00"}
                </h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <Card.Title className="d-flex align-items-center mb-3">
                  <FaChartLine className="me-2 text-info" />
                  This Month
                </Card.Title>
                <h3 className="text-center">
                  ${savingsData.thisMonthSavings?.toFixed(2) || "0.00"}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <Card.Title className="d-flex align-items-center mb-3">
                  <FaRecycle className="me-2 text-success" />
                  Waste Reduction
                </Card.Title>
                <h3 className="text-center">
                  {wasteReduction !== "N/A" ? `${wasteReduction}%` : "N/A"}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <Card.Title className="d-flex align-items-center mb-3">
                  <FaListUl className="me-2 text-warning" />
                  Categories Saved
                </Card.Title>
                <h3 className="text-center">
                  {Object.keys(savingsData.savingsByCategory || {}).length}
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Card.Title>Monthly Comparison</Card.Title>
                <div style={{ height: "300px" }}>
                  <Bar
                    data={monthlyData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Card.Title>Savings by Category</Card.Title>
                <div style={{ height: "300px" }}>
                  <Doughnut
                    data={savingBreakdownData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default SavingTrackingPage;
