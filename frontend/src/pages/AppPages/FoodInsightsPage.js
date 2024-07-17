import React from "react";
import useFoodInsights from "../../hooks/useFoodInsights";
import { Spinner, Alert } from "react-bootstrap";

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

  return (
    <div>
      <h2>Food Management Insights</h2>
      <p>
        Consumption Rate:{" "}
        {consumptionRate !== undefined ? consumptionRate.toFixed(2) : "N/A"}%
      </p>
      <p>
        Waste Rate: {wasteRate !== undefined ? wasteRate.toFixed(2) : "N/A"}%
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
  );
};

export default FoodInsightsPage;
