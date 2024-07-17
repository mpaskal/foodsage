import { useState, useCallback, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
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
  const setRecoilFoodItems = useSetRecoilState(foodItemsState);

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
        // Ensure the date fields are formatted correctly
        if (updates.purchasedDate) {
          updates.purchasedDate = new Date(updates.purchasedDate);
        }
        if (updates.expirationDate) {
          updates.expirationDate = new Date(updates.expirationDate);
        }

        const response = await api.post(`/food/items/update/${id}`, updates);
        console.log("Update Response:", response);

        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === id ? { ...item, ...updates } : item
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
        console.log("Attempting to delete item with ID:", id);
        const response = await api.post("/food/items/delete", { _id: id });
        console.log("Delete response:", response);

        if (response.status === 200) {
          setFoodItems((prevItems) =>
            prevItems.filter((item) => item._id !== id)
          );
          console.log("Item deleted successfully, updating state");
          await fetchItems();
          return { success: true, message: "Food item deleted successfully" };
        } else {
          console.log("Unexpected response status:", response.status);
          throw new Error(
            response.data.message || "Failed to delete the food item"
          );
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        setError("Failed to delete the food item: " + error.message);
        return { success: false, error: error.message };
      }
    },
    [setFoodItems, setError, fetchItems]
  );

  useEffect(() => {
    const fetchInitialItems = async () => {
      try {
        const response = await api.get("/food/items");
        console.log("Raw API response for food items state:", response.data);
        setRecoilFoodItems(
          response.data.map((item) => ({
            ...item,
            expirationDate: new Date(
              calculateExpirationDate(
                item.category,
                item.storage,
                item.purchasedDate
              )
            ),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    };

    fetchInitialItems();
  }, [setRecoilFoodItems]);

  return {
    foodItems,
    error,
    fetchItems,
    handleInputChange,
    handleDeleteItem,
  };
};
