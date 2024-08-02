import { useState, useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { toast } from "react-toastify";
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
  sessionExpiredState,
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
  const setSessionExpired = useSetRecoilState(sessionExpiredState);
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
        toast.error("Authentication error. Please log in again.");
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
        setRecentActivity(activityResponse.data.recentActivity);
        setError(null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (error.response) {
          switch (error.response.status) {
            case 401:
              setSessionExpired(true);
              // The api interceptor will handle the toast and redirect
              break;
            case 403:
              toast.error("You don't have permission to access the dashboard.");
              break;
            case 404:
              toast.error("Dashboard data not found. Please try again later.");
              break;
            case 500:
              toast.error("Server error. Please try again later.");
              break;
            default:
              toast.error("An unexpected error occurred. Please try again.");
          }
        } else if (error.request) {
          toast.error(
            "No response from server. Please check your internet connection."
          );
        } else {
          toast.error("An error occurred while setting up the request.");
        }
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [
    setFoodItems,
    setRecentActivity,
    authToken,
    authLoading,
    loggedInUser,
    setSessionExpired,
  ]);

  return {
    loading,
    error,
    wasteAtGlance,
    moneyMatters,
    inventoryStatus,
    actionNeeded,
  };
};

export default useDashboard;
