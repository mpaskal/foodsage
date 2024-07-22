import React, { useEffect, useState, lazy, Suspense } from "react";
import useFoodInsights from "../../hooks/useFoodInsights";
import { Spinner, Alert, Card, Row, Col, ListGroup } from "react-bootstrap";
import { getCurrentDateFormatted } from "../../utils/dateUtils";
import { Bar, Doughnut } from "react-chartjs-2";
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

const FoodInsightsPage = () => {
  const {
    foodItems,
    insights,
    loading,
    error,
    fetchAllFoodItems,
    calculateInsights,
    calculateWasteCost,
    predictFutureWaste,
  } = useFoodInsights();
  const currentDate = getCurrentDateFormatted();
  const [wasteCost, setWasteCost] = useState(null);
  const [predictedWaste, setPredictedWaste] = useState(null);

  useEffect(() => {
    fetchAllFoodItems();
  }, [fetchAllFoodItems]);

  useEffect(() => {
    if (foodItems.length > 0) {
      calculateInsights();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date();
      const wasteCostData = calculateWasteCost(startDate, endDate);
      setWasteCost(wasteCostData);

      const predictedWasteData = predictFutureWaste(30);
      setPredictedWaste(predictedWasteData);
    }
  }, [foodItems, calculateInsights, calculateWasteCost, predictFutureWaste]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">Error: {error.message}</Alert>;
  if (!insights) return <Alert variant="info">No insights available.</Alert>;

  const { consumptionRate, wasteRate } = insights;

  const ratesData = {
    labels: ["Consumption", "Waste"],
    datasets: [
      {
        data: [consumptionRate, wasteRate],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const wasteCostData = {
    labels: ["Current Waste Cost", "Predicted Waste"],
    datasets: [
      {
        label: "Waste Cost ($)",
        data: [wasteCost, predictedWaste],
        backgroundColor: ["#4BC0C0", "#FFCE56"],
      },
    ],
  };

  return (
    <Suspense fallback={<Spinner animation="border" />}>
      <Layout>
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="title">Food Management Insights</h1>
            <h2 className="text-muted">{currentDate}</h2>
          </div>
          <Row className="g-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Consumption vs Waste Rate</Card.Title>
                  <Doughnut data={ratesData} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Waste Cost Analysis</Card.Title>
                  <Bar
                    data={wasteCostData}
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
                  <Card.Title>Key Metrics</Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      Consumption Rate: {consumptionRate?.toFixed(2) || "N/A"}%
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Waste Rate: {wasteRate?.toFixed(2) || "N/A"}%
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Total Waste Cost (Last 30 days): $
                      {wasteCost?.toFixed(2) || "N/A"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Predicted Waste (Next 30 days): $
                      {predictedWaste?.toFixed(2) || "N/A"}
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Recommendations</Card.Title>
                  <ListGroup variant="flush">
                    {insights.recommendations?.map((rec, index) => (
                      <ListGroup.Item key={index}>{rec}</ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Layout>
    </Suspense>
  );
};

export default FoodInsightsPage;
