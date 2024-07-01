import { useRecoilCallback } from "recoil";
import axios from "axios";
import { foodItemsState } from "../recoil/atoms";

export const useFetchFoodItems = () => {
  return useRecoilCallback(({ set }) => async (page, itemsPerPage) => {
    try {
      const response = await axios.get(
        `/api/fooditems?page=${page}&limit=${itemsPerPage}`
      );
      if (response.data && Array.isArray(response.data.items)) {
        set(foodItemsState, response.data.items);
        return { success: true, totalPages: response.data.totalPages };
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error fetching food items", error);
      throw error;
    }
  });
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
