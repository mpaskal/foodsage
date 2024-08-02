import { useState, useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { toast } from "react-toastify";
import { allFoodItemsState } from "../recoil/foodItemsAtoms";
import api from "../utils/api";

export const useDashboardData = () => {
  const [allFoodItems, setAllFoodItems] = useRecoilState(allFoodItemsState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/food/items/all");
      console.log("Raw API response for all items:", response.data);

      const allItems = response.data.data;
      setAllFoodItems(allItems);
      // Removed success toast
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to fetch dashboard data: " + error.message);

      if (error.response) {
        switch (error.response.status) {
          case 401:
            // The api interceptor will handle this
            break;
          case 403:
            toast.error(
              "You don't have permission to access the dashboard data."
            );
            break;
          case 404:
            toast.error("Dashboard data not found. Please try again later.");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(
              "An unexpected error occurred while fetching dashboard data."
            );
        }
      } else if (error.request) {
        toast.error(
          "No response from server. Please check your internet connection."
        );
      } else {
        toast.error(
          "An error occurred while setting up the request for dashboard data."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [setAllFoodItems]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetchData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { error, isLoading, refetchData };
};

export default useDashboardData;
