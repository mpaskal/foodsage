import { useSetRecoilState, useRecoilCallback } from "recoil";
import { foodItemsState } from "../recoil/foodItemsAtoms"; // Make sure this path is correct
import axios from "axios";

export const useFetchFoodItems = () => {
  const setFoodItems = useSetRecoilState(foodItemsState);

  return async (page, itemsPerPage) => {
    try {
      const response = await axios.get(
        `/api/fooditems?page=${page}&itemsPerPage=${itemsPerPage}`
      );
      console.log("Raw API response:", response.data);

      // Assuming the API directly returns an array of items
      const items = Array.isArray(response.data) ? response.data : [];

      setFoodItems(items);

      return {
        success: true,
        items,
        totalPages: 1, // You may need to calculate this based on the number of items
        totalItems: items.length,
      };
    } catch (error) {
      console.error("Error fetching food items", error);
      return { success: false, error: error.message };
    }
  };
};

export const useAddFoodItem = () => {
  return useRecoilCallback(({ set }) => async (item, token) => {
    try {
      const response = await axios.post("/api/fooditems", item, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(foodItemsState, (oldItems) => [...oldItems, response.data]);
    } catch (error) {
      console.error("Error adding food item", error);
      throw error;
    }
  });
};

export const useUpdateFoodItem = () => {
  return useRecoilCallback(({ set }) => async (id, data) => {
    try {
      const response = await axios.patch(`/api/fooditems/${id}`, data);
      set(foodItemsState, (oldItems) =>
        oldItems.map((item) => (item._id === id ? response.data : item))
      );
    } catch (error) {
      console.error("Error updating food item", error);
      throw error;
    }
  });
};

export const useDeleteFoodItem = () => {
  return useRecoilCallback(({ set }) => async (id) => {
    try {
      await axios.delete(`/api/fooditems/${id}`);
      set(foodItemsState, (oldItems) =>
        oldItems.filter((item) => item._id !== id)
      );
      return { success: true };
    } catch (error) {
      console.error("Error deleting food item", error);
      return { success: false, error: error.message };
    }
  });
};
