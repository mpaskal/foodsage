// src/hooks/useFoodItemManagement.js

import { useState, useCallback } from "react";
import { useRecoilState } from "recoil";
import { foodItemsState } from "../recoil/foodItemsAtoms";
import {
  calculateExpirationDate,
  isExpired,
  getDaysSinceExpiration,
} from "../utils/dateUtils";
import api from "../utils/api";

export const useFoodItemManagement = (pageType) => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const response = await api.get("/food/items");
      const items = response.data.map((item) => ({
        ...item,
        expirationDate: calculateExpirationDate(
          item.category,
          item.storage,
          item.purchasedDate
        ),
      }));

      const filteredItems = items.filter((item) => {
        const daysSinceExpiration = getDaysSinceExpiration(item.expirationDate);

        switch (pageType) {
          case "food":
            return (
              item.moveTo !== "Waste" &&
              item.moveTo !== "Donate" &&
              (daysSinceExpiration <= 5 || item.consumed < 100)
            );
          case "waste":
            return item.moveTo === "Waste" && daysSinceExpiration <= 30;
          case "donation":
            return (
              item.moveTo === "Donate" &&
              (new Date() - new Date(item.lastStateChangeDate)) /
                (1000 * 60 * 60 * 24) <=
                30
            );
          default:
            return true;
        }
      });

      setFoodItems(filteredItems);
    } catch (error) {
      setError("Failed to fetch items");
      console.error("Error fetching items:", error);
    }
  }, [pageType, setFoodItems]);

  const handleInputChange = useCallback(
    async (id, field, value) => {
      try {
        let updates = { [field]: value };

        if (
          field === "category" ||
          field === "storage" ||
          field === "purchasedDate"
        ) {
          updates.expirationDate = calculateExpirationDate(
            field === "category"
              ? value
              : foodItems.find((item) => item._id === id).category,
            field === "storage"
              ? value
              : foodItems.find((item) => item._id === id).storage,
            field === "purchasedDate"
              ? value
              : foodItems.find((item) => item._id === id).purchasedDate
          );
        }

        if (field === "consumed") {
          updates[field] = parseInt(value, 10);
          if (updates[field] === 100) {
            updates.moveTo = "Consumed";
          }
        }

        if (field === "moveTo") {
          updates.lastStateChangeDate = new Date().toISOString();
          if (value === "Consumed") {
            updates.consumed = 100;
          }
        }

        await api.put(`/food/items/${id}`, updates);

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
    [foodItems, setFoodItems]
  );

  const handleDeleteItem = useCallback(
    async (id) => {
      try {
        await api.delete(`/food/items/${id}`);
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
