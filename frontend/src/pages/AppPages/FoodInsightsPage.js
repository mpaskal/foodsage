import React, { useEffect, useState } from "react";
import {
  useGenerateInsights,
  useCalculateWasteCost,
  usePredictFutureWaste,
} from "../../actions/foodItemActions";

const FoodInsightsPage = () => {
  const generateInsights = useGenerateInsights();
  const calculateWasteCost = useCalculateWasteCost();
  const predictFutureWaste = usePredictFutureWaste();
  const [insights, setInsights] = useState(null);
  const [wasteCost, setWasteCost] = useState(0);
  const [predictedWaste, setPredictedWaste] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = new Date();
      const insightData = await generateInsights(startDate, endDate);
      setInsights(insightData);

      const totalWasteCost = await calculateWasteCost(startDate, endDate);
      setWasteCost(totalWasteCost);

      const predictedWaste = await predictFutureWaste(30); // Predict for next 30 days
      setPredictedWaste(predictedWaste);
    };

    fetchData();
  }, []);

  if (!insights) return <div>Loading...</div>;

  return (
    <div>
      <h2>Food Management Insights</h2>
      <p>Consumption Rate: {insights.insights.consumptionRate.toFixed(2)}%</p>
      <p>Waste Rate: {insights.insights.wasteRate.toFixed(2)}%</p>
      <p>Total Waste Cost (Last 30 days): ${wasteCost.toFixed(2)}</p>
      <p>Predicted Waste (Next 30 days): ${predictedWaste.toFixed(2)}</p>
      <h3>Recommendations:</h3>
      <ul>
        {insights.recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
};

export default FoodInsightsPage;
