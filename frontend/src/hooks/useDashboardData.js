import { useState, useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { allFoodItemsState } from "../recoil/foodItemsAtoms";
import api from "../utils/api";

export const useDashboardData = () => {
  const [allFoodItems, setAllFoodItems] = useRecoilState(allFoodItemsState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all items
      const response = await api.get("/food/items/all");
      console.log("Raw API response for all items:", response.data);

      // Assuming the API returns the items directly in the data property
      const allItems = response.data.data;

      setAllFoodItems(allItems);
    } catch (error) {
      setError("Failed to fetch dashboard data: " + error.message);
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setAllFoodItems]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { error, isLoading, refetchData: fetchDashboardData };
};

export default useDashboardData;
