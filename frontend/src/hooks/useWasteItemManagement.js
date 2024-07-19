import { useState, useCallback, useEffect } from "react";
import { foodItemsState, wasteItemsSelector } from "../recoil/foodItemsAtoms";
import { useSetRecoilState, useRecoilValue } from "recoil";
import api from "../utils/api";

export const useWasteItemManagement = () => {
  const setFoodItems = useSetRecoilState(foodItemsState);
  const wasteItems = useRecoilValue(wasteItemsSelector);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/waste/items?page=${currentPage}&limit=10`
      );
      console.log("API Response in useWasteItemManagement:", response);

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error("Invalid data structure received from the server");
      }

      setFoodItems((prevItems) => {
        const nonWasteItems = prevItems.filter(
          (item) => item.status !== "Waste"
        );
        const newWasteItems = response.data.data.map((item) => ({
          ...item,
          status: "Waste",
        }));

        console.log("New waste items:", newWasteItems);

        const newItems = [...nonWasteItems, ...newWasteItems];
        console.log("New food items state:", newItems);

        return newItems;
      });

      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);

      console.log("Fetched Waste Items:", response.data.data);
    } catch (error) {
      setError("Failed to fetch waste items: " + error.message);
      console.error("Error fetching waste items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setFoodItems, currentPage]);

  const handleInputChange = useCallback(
    async (id, updates) => {
      try {
        const response = await api.post(`/waste/items/update/${id}`, updates);
        console.log("Update Response:", response);

        if (response.status === 200) {
          setFoodItems((prevItems) =>
            prevItems.map((item) =>
              item._id === id
                ? { ...item, ...response.data.data, status: "Waste" }
                : item
            )
          );
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
    [setFoodItems]
  );

  const handleDeleteItem = useCallback(
    async (id) => {
      try {
        const response = await api.post("/waste/items/delete", { _id: id });
        console.log("Delete response:", response);

        if (response.status === 200) {
          setFoodItems((prevItems) =>
            prevItems.filter((item) => item._id !== id)
          );
          await fetchItems();
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
    [setFoodItems, fetchItems]
  );

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, currentPage]);

  return {
    wasteItems,
    error,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    fetchItems,
    handleInputChange,
    handleDeleteItem,
    handlePageChange,
  };
};

export default useWasteItemManagement;
