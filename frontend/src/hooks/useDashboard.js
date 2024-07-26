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
import {
  authTokenState,
  authLoadingState,
  loggedInUserState,
} from "../recoil/userAtoms";
import api from "../utils/api";

export const useDashboard = () => {
  const setFoodItems = useSetRecoilState(allFoodItemsState);
  const setRecentActivity = useSetRecoilState(recentActivityState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = useRecoilValue(authTokenState);
  const authLoading = useRecoilValue(authLoadingState);
  const loggedInUser = useRecoilValue(loggedInUserState);

  const wasteAtGlance = useRecoilValue(wasteAtGlanceSelector);
  const moneyMatters = useRecoilValue(moneyMattersSelector);
  const inventoryStatus = useRecoilValue(inventoryStatusSelector);
  const actionNeeded = useRecoilValue(actionNeededSelector);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) {
        return;
      }

      if (!authToken || !loggedInUser) {
        setError("No authentication token or user information found");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [itemsResponse, activityResponse] = await Promise.all([
          api.get("/food/items/all"),
          api.get("/dashboard/recent-activity"),
        ]);

        console.log("Items Response:", itemsResponse.data);
        console.log("Activity Response:", activityResponse.data);

        setFoodItems(itemsResponse.data.data);
        setRecentActivity(activityResponse.data.recentActivity); // Make sure it's accessing .recentActivity
        setError(null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [setFoodItems, setRecentActivity, authToken, authLoading, loggedInUser]);

  return {
    loading,
    error,
    wasteAtGlance,
    moneyMatters,
    inventoryStatus,
    actionNeeded,
  };
};
