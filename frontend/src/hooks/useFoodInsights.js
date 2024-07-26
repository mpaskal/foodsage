import { useState, useCallback, useEffect } from "react";
import { useFoodItemsFetching } from "./useFoodItemsFetching";

const useFoodInsights = () => {
  const { foodItems, isLoading, error, fetchAllFoodItems } =
    useFoodItemsFetching();
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetchAllFoodItems();
  }, [fetchAllFoodItems]);

  const calculateInsights = useCallback(() => {
    if (foodItems.length === 0) return;

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

    setInsights({
      consumptionRate,
      wasteRate,
      recommendations,
    });
  }, [foodItems]);

  useEffect(() => {
    calculateInsights();
  }, [calculateInsights]);

  const calculateWasteCost = useCallback(
    (startDate, endDate) => {
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
      const averageDailyWaste =
        foodItems.filter((item) => item.status === "Waste").length / 30;
      return averageDailyWaste * days;
    },
    [foodItems]
  );

  return {
    foodItems,
    insights,
    isLoading,
    error,
    fetchAllFoodItems,
    calculateInsights,
    calculateWasteCost,
    predictFutureWaste,
  };
};

export default useFoodInsights;
