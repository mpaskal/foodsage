import { useState, useCallback, useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { foodItemsState, wasteItemsSelector } from "../recoil/foodItemsAtoms";
import api from "../utils/api";

export const useWasteItemManagement = () => {
  const setFoodItems = useSetRecoilState(foodItemsState);
  const wasteItems = useRecoilValue(wasteItemsSelector);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/waste/items");
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error("Invalid data structure received from the server");
      }
      setFoodItems((prevItems) => {
        const nonWasteItems = prevItems.filter(
          (item) => item.status !== "Waste"
        );
        return [...nonWasteItems, ...response.data.data];
      });
    } catch (error) {
      setError("Failed to fetch waste items: " + error.message);
      console.error("Error fetching waste items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setFoodItems]);

  const handleInputChange = useCallback(
    async (id, updates) => {
      try {
        const response = await api.post(`/waste/items/update/${id}`, updates);
        if (response.status === 200) {
          setFoodItems((prevItems) => {
            return prevItems.map((item) =>
              item._id === id ? { ...item, ...response.data.data } : item
            );
          });
          // If the status has changed from "Waste", refetch the items
          if (updates.status && updates.status !== "Waste") {
            fetchItems();
          }
        } else {
          throw new Error(
            response.data.message || "Failed to update the waste item"
          );
        }
      } catch (error) {
        console.error("Error updating waste item:", error);
        setError("Failed to update waste item: " + error.message);
      }
    },
    [setFoodItems, fetchItems]
  );

  const handleDeleteItem = useCallback(
    async (id) => {
      try {
        const response = await api.post("/waste/items/delete", { _id: id });
        if (response.status === 200) {
          setFoodItems((prevItems) =>
            prevItems.filter((item) => item._id !== id)
          );
          return { success: true, message: "Waste item deleted successfully" };
        } else {
          throw new Error(
            response.data.message || "Failed to delete the waste item"
          );
        }
      } catch (error) {
        console.error("Error deleting waste item:", error);
        setError("Failed to delete the waste item: " + error.message);
        return { success: false, error: error.message };
      }
    },
    [setFoodItems]
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    wasteItems,
    error,
    isLoading,
    fetchItems,
    handleInputChange,
    handleDeleteItem,
  };
};

export default useWasteItemManagement;
