import React, { useEffect, useState, lazy } from "react";
import useFoodInsights from "../../hooks/useFoodInsights";
import { Spinner, Alert } from "react-bootstrap";
import { getCurrentDateFormatted } from "../../utils/dateUtils";

const Layout = lazy(() => import("../../components/Layout/LayoutApp"));

const FoodInsightsPage = () => {
  const { insights, loading, error, calculateWasteCost, predictFutureWaste } =
    useFoodInsights();
  const currentDate = getCurrentDateFormatted();
  const [wasteCost, setWasteCost] = useState(null);
  const [predictedWaste, setPredictedWaste] = useState(null);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (insights) {
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = new Date();
        const wasteCostData = await calculateWasteCost(startDate, endDate);
        setWasteCost(wasteCostData);

        const predictedWasteData = await predictFutureWaste(30);
        setPredictedWaste(predictedWasteData);
      }
    };

    fetchAdditionalData();
  }, [insights, calculateWasteCost, predictFutureWaste]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">Error: {error.message}</Alert>;
  if (!insights) return <Alert variant="info">No insights available.</Alert>;

  const { consumptionRate, wasteRate } = insights.insights || {};

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="title">Food Management Insights</h1>
          <h2>{currentDate}</h2>
        </div>
        <div className="d-flex flex-column mb-1">
          <p>Consumption Rate: {consumptionRate?.toFixed(2) || "N/A"}%</p>
          <p>Waste Rate: {wasteRate?.toFixed(2) || "N/A"}%</p>
          <p>
            Total Waste Cost (Last 30 days): ${wasteCost?.toFixed(2) || "N/A"}
          </p>
          <p>
            Predicted Waste (Next 30 days): $
            {predictedWaste?.toFixed(2) || "N/A"}
          </p>
          <h3>Recommendations:</h3>
          <ul>
            {insights.recommendations?.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default FoodInsightsPage;
