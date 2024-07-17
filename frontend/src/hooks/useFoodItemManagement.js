import { useState, useCallback } from "react";
import { useRecoilState } from "recoil";
import { foodItemsState } from "../recoil/foodItemsAtoms";
import {
  calculateExpirationDate,
  getDaysSinceExpiration,
  formatDateForDisplay,
} from "../utils/dateUtils";
import api from "../utils/api";

export const useFoodItemManagement = (pageType) => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const response = await api.get("/food/items");
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
      }));

      console.log("Processed Items:", items);

      const filteredItems = items.filter((item) => {
        const daysSinceExpiration = getDaysSinceExpiration(item.expirationDate);

        switch (pageType) {
          case "food":
            return (
              item.status !== "Waste" &&
              item.status !== "Donate" &&
              (daysSinceExpiration <= 5 || item.consumed < 100)
            );
          case "waste":
            return item.status === "Waste" && daysSinceExpiration <= 30;
          case "donation":
            return (
              item.status === "Donate" &&
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
    }
  }, [pageType, setFoodItems]);

  const handleInputChange = useCallback(
    async (id, updates) => {
      try {
        // Ensure the date fields are formatted correctly and not null
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

        // If dates are not provided, don't include them in the update
        const updatesToSend = Object.keys(updates).reduce((acc, key) => {
          if (updates[key] !== null && updates[key] !== undefined) {
            acc[key] = updates[key];
          }
          return acc;
        }, {});

        const response = await api.post(
          `/food/items/update/${id}`,
          updatesToSend
        );
        console.log("Update Response:", response);

        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === id ? { ...item, ...response.data.data } : item
          )
        );
      } catch (error) {
        setError("Failed to update item");
        console.error("Error updating item:", error);
      }
    },
    [setFoodItems]
  );

  const handleDeleteItem = useCallback(
    async (id) => {
      try {
        await api.post(`/food/items/delete`, { id });
        setFoodItems((prevItems) =>
          prevItems.filter((item) => item._id !== id)
        );
      } catch (error) {
        setError("Failed to delete item");
        console.error("Error deleting item:", error);
      }
    },
    [setFoodItems]
  );

  return {
    foodItems,
    error,
    fetchItems,
    handleInputChange,
    handleDeleteItem,
  };
};
