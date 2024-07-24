import { useState, useCallback, useEffect } from "react";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import {
  allFoodItemsState,
  recentActivityState,
} from "../recoil/foodItemsAtoms";
import { loggedInUserState } from "../recoil/userAtoms";
import {
  getDaysSinceExpiration,
  formatDateForDisplay,
} from "../utils/dateUtils";
import api from "../utils/api";
import { useFoodItemsFetching } from "./useFoodItemsFetching";

export const useFoodItemManagement = (pageType) => {
  const [foodItems, setFoodItems] = useRecoilState(allFoodItemsState);
  const setRecentActivity = useSetRecoilState(recentActivityState);
  const loggedInUser = useRecoilValue(loggedInUserState);
  const { isLoading, error, fetchAllFoodItems } = useFoodItemsFetching();

  const fetchItems = useCallback(async () => {
    await fetchAllFoodItems();
  }, [fetchAllFoodItems]);

  const filterItems = useCallback(
    (items) => {
      console.log("Filtering items:", items);
      return items.filter((item) => {
        const daysSinceExpiration = getDaysSinceExpiration(item.expirationDate);
        const result =
          item.status === "Active" &&
          (daysSinceExpiration <= 5 || item.consumed < 100);
        console.log(`Item ${item._id} filtered:`, result);
        return result;
      });
    },
    [pageType]
  );

  useEffect(() => {
    console.log("Effect running to filter items");
    setFoodItems((prevItems) => {
      const filteredItems = filterItems(prevItems);
      console.log("Filtered items in effect:", filteredItems);
      return filteredItems;
    });
  }, [filterItems, setFoodItems]);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const response = await api.get("/food/items/recent-activity");
      setRecentActivity(response.data);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  }, [setRecentActivity]);

  const handleInputChange = useCallback(
    async (id, updates) => {
      try {
        if (updates.purchasedDate) {
          updates.purchasedDate = formatDateForDisplay(
            new Date(updates.purchasedDate)
          );
        }
        if (updates.expirationDate) {
          updates.expirationDate = formatDateForDisplay(
            new Date(updates.expirationDate)
          );
        }

        console.log("Logged user", loggedInUser.id);
        console.log("Sending update:", {
          ...updates,
          updatedBy: loggedInUser?.id,
        });

        const response = await api.post(`/food/items/update/${id}`, {
          ...updates,
          updatedBy: loggedInUser?.id,
        });
        console.log("Update Response:", response);

        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === id
              ? { ...item, ...response.data.data, updatedBy: loggedInUser?.id }
              : item
          )
        );

        await fetchRecentActivity();
      } catch (error) {
        console.error("Error updating item:", error);
      }
    },
    [setFoodItems, fetchRecentActivity, loggedInUser]
  );

  const handleDeleteItem = useCallback(
    async (id) => {
      try {
        await api.post(`/food/items/delete`, { _id: id });
        setFoodItems((prevItems) =>
          prevItems.filter((item) => item._id !== id)
        );
        await fetchRecentActivity();
        return { success: true, message: "Item deleted successfully" };
      } catch (error) {
        console.error("Error deleting item:", error);
        return { success: false, error: "Failed to delete item" };
      }
    },
    [setFoodItems, fetchRecentActivity]
  );

  useEffect(() => {
    fetchItems();
    fetchRecentActivity();
  }, [fetchItems, fetchRecentActivity]);

  useEffect(() => {
    setFoodItems((prevItems) => filterItems(prevItems));
  }, [filterItems, setFoodItems]);

  return {
    foodItems,
    error,
    isLoading,
    fetchItems,
    handleInputChange,
    handleDeleteItem,
    fetchRecentActivity,
  };
};
