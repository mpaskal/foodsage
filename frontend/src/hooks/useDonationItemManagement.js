import { useState, useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { allFoodItemsState } from "../recoil/foodItemsAtoms";
import api from "../utils/api";

export const useDonationItemManagement = () => {
  const [foodItems, setFoodItems] = useRecoilState(allFoodItemsState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const donationItems = foodItems.filter(
    (item) => item.status === "Donation" || item.status === "Donated"
  );

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/donation/items?page=${currentPage}&limit=10`
      );
      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error("Invalid data structure received from the server");
      }

      setFoodItems((prevItems) => {
        const nonDonationItems = prevItems.filter(
          (item) => item.status !== "Donation" && item.status !== "Donated"
        );
        return [...nonDonationItems, ...response.data.data];
      });

      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      setError("Failed to fetch donation items: " + error.message);
      console.error("Error fetching donation items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setFoodItems, currentPage]);

  const handleInputChange = useCallback(
    async (id, updates) => {
      try {
        const response = await api.post(
          `/donation/items/update/${id}`,
          updates
        );
        if (response.status === 200) {
          setFoodItems((prevItems) =>
            prevItems.map((item) =>
              item._id === id ? { ...item, ...response.data.data } : item
            )
          );
        } else {
          throw new Error(
            response.data.message || "Failed to update the donation item"
          );
        }
      } catch (error) {
        console.error("Error updating donation item:", error);
        setError("Failed to update donation item: " + error.message);
      }
    },
    [setFoodItems]
  );

  const handleDeleteItem = useCallback(
    async (id) => {
      try {
        const response = await api.post("/donation/items/delete", { _id: id });
        if (response.status === 200) {
          setFoodItems((prevItems) =>
            prevItems.filter((item) => item._id !== id)
          );
          await fetchItems();
          return {
            success: true,
            message: "Donation item deleted successfully",
          };
        } else {
          throw new Error(
            response.data.message || "Failed to delete the donation item"
          );
        }
      } catch (error) {
        console.error("Error deleting donation item:", error);
        setError("Failed to delete the donation item: " + error.message);
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
    donationItems,
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

export default useDonationItemManagement;
