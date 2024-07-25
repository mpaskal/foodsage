import { useState, useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import {
  allFoodItemsState,
  wasteAtGlanceSelector,
  moneyMattersSelector,
  inventoryStatusSelector,
  actionNeededSelector,
  recentActivityState,
} from "../recoil/foodItemsAtoms";
import { authTokenState, authLoadingState } from "../recoil/userAtoms";
import api from "../utils/api";

export const useDashboard = () => {
  console.log("useDashboard hook called");
  const setFoodItems = useSetRecoilState(allFoodItemsState);
  const setRecentActivity = useSetRecoilState(recentActivityState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = useRecoilValue(authTokenState);
  const authLoading = useRecoilValue(authLoadingState);

  const wasteAtGlance = useRecoilValue(wasteAtGlanceSelector);
  const moneyMatters = useRecoilValue(moneyMattersSelector);
  const inventoryStatus = useRecoilValue(inventoryStatusSelector);
  const actionNeeded = useRecoilValue(actionNeededSelector);

  console.log("authToken in useDashboard:", authToken);
  console.log("authLoading in useDashboard:", authLoading);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) {
        console.log("Auth is still loading, waiting...");
        return;
      }

      if (!authToken) {
        console.warn("No authentication token found in useDashboard");
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching dashboard data with authToken:", authToken);

        const [itemsResponse, activityResponse] = await Promise.all([
          api.get("/food/items/all"),
          api.get("/food/items/recent-activity"),
        ]);

        console.log("Food items response:", itemsResponse);
        console.log("Activity response:", activityResponse);

        setFoodItems(itemsResponse.data.data);
        setRecentActivity(activityResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        console.error("Error details:", error.response?.data);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [setFoodItems, setRecentActivity, authToken, authLoading]);

  return {
    loading,
    error,
    wasteAtGlance,
    moneyMatters,
    inventoryStatus,
    actionNeeded,
  };
};
