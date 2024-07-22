import { useState, useCallback, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  allFoodItemsState,
  recentActivityState,
} from "../recoil/foodItemsAtoms";
import {
  calculateExpirationDate,
  getDaysSinceExpiration,
  formatDateForDisplay,
} from "../utils/dateUtils";
import api from "../utils/api";

export const useFoodItemManagement = (pageType) => {
  const [foodItems, setFoodItems] = useRecoilState(allFoodItemsState);
  const setRecentActivity = useSetRecoilState(recentActivityState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/food/items/all");
      console.log("API Response:", response);

      const itemsArray = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      if (!Array.isArray(itemsArray)) {
        throw new Error("Invalid data structure received from the server");
      }

      const items = itemsArray.map((item) => ({
        ...item,
        expirationDate: calculateExpirationDate(
          item.category,
          item.storage,
          item.purchasedDate
        ),
        purchasedDate: formatDateForDisplay(new Date(item.purchasedDate)),
        ...(item.expirationDate && {
          expirationDate: formatDateForDisplay(new Date(item.expirationDate)),
        }),
        updatedByName: item.updatedBy
          ? `${item.updatedBy.firstName} ${item.updatedBy.lastName}`
          : "Unknown User",
      }));

      console.log("Processed Items:", items);

      const filteredItems = items.filter((item) => {
        const daysSinceExpiration = getDaysSinceExpiration(item.expirationDate);

        switch (pageType) {
          case "food":
            return (
              item.status !== "Waste" &&
              item.status !== "Donation" &&
              (daysSinceExpiration <= 5 || item.consumed < 100)
            );
          case "waste":
            return item.status === "Waste" && daysSinceExpiration <= 30;
          case "donation":
            return (
              item.status === "Donation" &&
              (new Date() - new Date(item.lastStateChangeDate)) /
                (1000 * 60 * 60 * 24) <=
                30
            );
          default:
            return true;
        }
      });

      console.log("Filtered Items:", filteredItems);
      setFoodItems(filteredItems);
    } catch (error) {
      setError("Failed to fetch items");
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pageType, setFoodItems]);

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

        const response = await api.post(`/food/items/update/${id}`, updates);
        console.log("Update Response:", response);

        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === id ? { ...item, ...response.data.data } : item
          )
        );

        await fetchRecentActivity();
      } catch (error) {
        setError("Failed to update item");
        console.error("Error updating item:", error);
      }
    },
    [setFoodItems, fetchRecentActivity]
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
