import { useState, useEffect, useCallback } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";
import { foodItemsState } from "../recoil/foodItemsAtoms";
import axios from "axios";
import {
  calculateAverageTimeToConsumption,
  calculateFoodTurnoverRate,
} from "../utils/foodItemCalcUtils";
import api from "../utils/api";

export const useFoodInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      console.log(
        `Fetching insights from: ${api.defaults.baseURL}/food/insights`
      );
      console.log("With params:", { startDate, endDate });
      const response = await api.get("/food/insights", {
        params: { startDate, endDate },
      });
      console.log("Insights response:", response.data);
      setInsights(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching insights:", error.response || error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const startDate = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const endDate = new Date().toISOString();
    fetchInsights(startDate, endDate);
  }, [fetchInsights]);

  const generateInsights = useCallback(
    async (startDate, endDate) => {
      return fetchInsights(startDate, endDate);
    },
    [fetchInsights]
  );

  const predictFutureWaste = useCallback(async (days) => {
    try {
      const response = await api.get("/food/insights/predictwaste", {
        params: { days },
      });
      return response.data.predictedWaste;
    } catch (error) {
      console.error("Error predicting future waste", error);
      throw error;
    }
  }, []);

  const calculateAverageConsumptionTime = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        try {
          const foodItems = await snapshot.getPromise(foodItemsState);
          return calculateAverageTimeToConsumption(foodItems);
        } catch (error) {
          console.error("Error calculating average consumption time", error);
          throw error;
        }
      },
    []
  );

  const calculateWasteCost = useCallback(async (startDate, endDate) => {
    try {
      const response = await api.get("/food/insights/wastecost", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data.totalWasteCost;
    } catch (error) {
      console.error("Error calculating waste cost", error);
      throw error;
    }
  }, []);

  const calculateTurnoverRate = useRecoilCallback(
    ({ snapshot }) =>
      async (period) => {
        try {
          const foodItems = await snapshot.getPromise(foodItemsState);
          return calculateFoodTurnoverRate(foodItems, period);
        } catch (error) {
          console.error("Error calculating turnover rate", error);
          throw error;
        }
      },
    []
  );

  return {
    insights,
    loading,
    error,
    generateInsights,
    calculateWasteCost,
    predictFutureWaste,
    calculateAverageConsumptionTime,
    calculateTurnoverRate,
  };
};

export default useFoodInsights;
