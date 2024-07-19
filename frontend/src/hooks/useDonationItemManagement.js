import { useState, useCallback, useEffect } from "react";
import {
  foodItemsState,
  donationItemsSelector,
} from "../recoil/foodItemsAtoms";
import { useSetRecoilState, useRecoilValue } from "recoil";
import api from "../utils/api";

export const useDonationItemManagement = () => {
  const setFoodItems = useSetRecoilState(foodItemsState);
  const donationItems = useRecoilValue(donationItemsSelector);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/donation/items?page=${currentPage}&limit=10`
      );
      console.log("API Response in useDonationItemManagement:", response);

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error("Invalid data structure received from the server");
      }

      setFoodItems((prevItems) => {
        const nonDonationItems = prevItems.filter(
          (item) => item.status !== "Donation" && item.status !== "Donated"
        );
        const newDonationItems = response.data.data.map((item) => ({
          ...item,
          status: item.status === "Donated" ? "Donated" : "Donation",
        }));

        console.log("New donation items:", newDonationItems);

        const newItems = [...nonDonationItems, ...newDonationItems];
        console.log("New food items state:", newItems);

        return newItems;
      });

      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);

      console.log("Fetched Donation Items:", response.data.data);
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
        console.log("Update Response:", response);

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
        console.log("Delete response:", response);

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
