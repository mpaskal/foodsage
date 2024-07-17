import React from "react";
import useFoodInsights from "../../hooks/useFoodInsights";
import { Spinner, Alert } from "react-bootstrap";
import Layout from "../../components/Layout/LayoutApp";

const FoodInsightsPage = () => {
  const { insights, loading, error, calculateWasteCost, predictFutureWaste } =
    useFoodInsights();

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">Error: {error.message}</Alert>;
  if (!insights) return <Alert variant="info">No insights available.</Alert>;

  // Safely access nested properties
  const consumptionRate = insights?.insights?.consumptionRate;
  const wasteRate = insights?.insights?.wasteRate;
  const wasteCost = insights?.wasteCost;
  const predictedWaste = insights?.predictedWaste;

  const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  };

  const currentDate = getCurrentDateFormatted();

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="title">Food Management Insights</h1>
          <h2>{currentDate}</h2>
        </div>
        <div className="d-flex justify-content-end mb-1">
          <p>
            Consumption Rate:{" "}
            {consumptionRate !== undefined ? consumptionRate.toFixed(2) : "N/A"}
            %
          </p>
          <p>
            Waste Rate: {wasteRate !== undefined ? wasteRate.toFixed(2) : "N/A"}
            %
          </p>
          <p>
            Total Waste Cost (Last 30 days): $
            {wasteCost !== undefined ? wasteCost.toFixed(2) : "N/A"}
          </p>
          <p>
            Predicted Waste (Next 30 days): $
            {predictedWaste !== undefined ? predictedWaste.toFixed(2) : "N/A"}
          </p>
          <h3>Recommendations:</h3>
          <ul>
            {insights.recommendations &&
              insights.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default FoodInsightsPage;
