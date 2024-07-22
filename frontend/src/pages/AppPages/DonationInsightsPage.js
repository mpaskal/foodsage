// src/pages/AppPages/DonationInsightsPage.js

import React, { useEffect, lazy, Suspense } from "react";
import useDonationInsights from "../../hooks/useDonationInsights";
import { Spinner, Alert, Card, Row, Col, ListGroup } from "react-bootstrap";
import { getCurrentDateFormatted } from "../../utils/dateUtils";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Layout = lazy(() => import("../../components/Layout/LayoutApp"));

const DonationInsightsPage = () => {
  const {
    donationItems,
    insights,
    loading,
    error,
    fetchDonationItems,
    calculateInsights,
  } = useDonationInsights();
  const currentDate = getCurrentDateFormatted();

  useEffect(() => {
    fetchDonationItems();
  }, [fetchDonationItems]);

  useEffect(() => {
    if (donationItems.length > 0) {
      calculateInsights();
    }
  }, [donationItems, calculateInsights]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">Error: {error}</Alert>;
  if (!insights) return <Alert variant="info">No insights available.</Alert>;

  const { totalDonations, donatedItems, pendingDonations, donationRate } =
    insights;

  const donationStatusData = {
    labels: ["Donated", "Pending"],
    datasets: [
      {
        data: [donatedItems, pendingDonations],
        backgroundColor: ["#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#36A2EB", "#FFCE56"],
      },
    ],
  };

  const donationTrendsData = {
    labels: ["Total Donations", "Donated Items", "Pending Donations"],
    datasets: [
      {
        label: "Donation Trends",
        data: [totalDonations, donatedItems, pendingDonations],
        backgroundColor: ["#4BC0C0", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  return (
    <Suspense fallback={<Spinner animation="border" />}>
      <Layout>
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="title">Donation Insights</h1>
            <h2 className="text-muted">{currentDate}</h2>
          </div>
          <Row className="g-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Donation Status</Card.Title>
                  <Doughnut data={donationStatusData} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Donation Trends</Card.Title>
                  <Bar
                    data={donationTrendsData}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Donation Metrics</Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      Total Donations: {totalDonations}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Donated Items: {donatedItems}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Pending Donations: {pendingDonations}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Donation Rate: {donationRate.toFixed(2)}%
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Donation Impact</Card.Title>
                  <p>
                    Your donations have helped {donatedItems} items find new
                    homes!
                  </p>
                  <p>
                    Keep up the great work in reducing food waste through
                    donations.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Layout>
    </Suspense>
  );
};

export default DonationInsightsPage;
