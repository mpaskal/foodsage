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
    const consumptionRate =
      (foodItems.filter((item) => item.status === "Consumed").length /
        foodItems.length) *
      100;
    const wasteRate =
      (foodItems.filter((item) => item.status === "Waste").length /
        foodItems.length) *
      100;

    let recommendations = [];

    if (wasteRate > 20) {
      recommendations.push(
        "Your waste rate is higher than average. Consider meal planning to reduce food waste."
      );
    }

    if (consumptionRate > 80) {
      recommendations.push(
        "You're doing great with consumption! Keep up the good work."
      );
    }

    if (wasteRate > consumptionRate) {
      recommendations.push(
        "Try freezing excess produce to extend its life and reduce waste."
      );
      recommendations.push(
        "Consider donating excess non-perishables to local food banks."
      );
    }

    // Add more conditions and recommendations based on your business logic

    setInsights({
      consumptionRate,
      wasteRate,
      recommendations,
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
