import { useState, useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { foodItemsState } from "../recoil/foodItemsAtoms";
import api from "../utils/api";

export const useDashboardData = () => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch active items
      const activeResponse = await api.get("/food/items");
      const activeItems = activeResponse.data.data;

      // Fetch waste items
      const wasteResponse = await api.get("/waste/items");
      const wasteItems = wasteResponse.data.data;

      // Fetch donation items
      const donationResponse = await api.get("/donation/items");
      const donationItems = donationResponse.data.data;

      // Combine active and waste items
      const allItems = [...activeItems, ...wasteItems, ...donationItems];

      setFoodItems(allItems);
    } catch (error) {
      setError("Failed to fetch dashboard data: " + error.message);
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setFoodItems]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { error, isLoading, refetchData: fetchDashboardData };
};

export default useDashboardData;
