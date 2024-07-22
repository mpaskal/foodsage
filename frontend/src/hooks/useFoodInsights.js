import { useState, useCallback } from "react";
import api from "../utils/api";

const useFoodInsights = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllFoodItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/food/items/all");
      setFoodItems(response.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateInsights = useCallback(() => {
    // Implement logic to calculate insights based on foodItems
    // This is a placeholder and should be replaced with actual logic
    const consumptionRate =
      (foodItems.filter((item) => item.status === "Consumed").length /
        foodItems.length) *
      100;
    const wasteRate =
      (foodItems.filter((item) => item.status === "Waste").length /
        foodItems.length) *
      100;

    setInsights({
      consumptionRate,
      wasteRate,
      recommendations: ["Placeholder recommendation"],
    });
  }, [foodItems]);

  const calculateWasteCost = useCallback(
    (startDate, endDate) => {
      // Implement logic to calculate waste cost based on foodItems
      // This is a placeholder and should be replaced with actual logic
      return foodItems
        .filter(
          (item) =>
            item.status === "Waste" &&
            new Date(item.statusChangeDate) >= startDate &&
            new Date(item.statusChangeDate) <= endDate
        )
        .reduce((sum, item) => sum + item.cost, 0);
    },
    [foodItems]
  );

  const predictFutureWaste = useCallback(
    (days) => {
      // Implement logic to predict future waste based on foodItems
      // This is a placeholder and should be replaced with actual logic
      const averageDailyWaste =
        foodItems.filter((item) => item.status === "Waste").length / 30;
      return averageDailyWaste * days;
    },
    [foodItems]
  );

  return {
    foodItems,
    insights,
    loading,
    error,
    fetchAllFoodItems,
    calculateInsights,
    calculateWasteCost,
    predictFutureWaste,
  };
};

export default useFoodInsights;
