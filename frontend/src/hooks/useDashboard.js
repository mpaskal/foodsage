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
import api from "../utils/api";

export const useDashboard = () => {
  const setFoodItems = useSetRecoilState(allFoodItemsState);
  const setRecentActivity = useSetRecoilState(recentActivityState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const wasteAtGlance = useRecoilValue(wasteAtGlanceSelector);
  const moneyMatters = useRecoilValue(moneyMattersSelector);
  const inventoryStatus = useRecoilValue(inventoryStatusSelector);
  const actionNeeded = useRecoilValue(actionNeededSelector);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [itemsResponse, activityResponse] = await Promise.all([
          api.get("/food/items/all"),
          api.get("/food/items/recent-activity"),
        ]);

        setFoodItems(itemsResponse.data.data);
        setRecentActivity(activityResponse.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [setFoodItems, setRecentActivity]);

  return {
    loading,
    error,
    wasteAtGlance,
    moneyMatters,
    inventoryStatus,
    actionNeeded,
  };
};
