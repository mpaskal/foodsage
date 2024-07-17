import { useSetRecoilState, useRecoilCallback } from "recoil";
import { foodItemsState } from "../recoil/foodItemsAtoms";
import axios from "axios";
import {
  calculateAverageTimeToConsumption,
  calculateFoodTurnoverRate,
  calculateOptimalReorderPoint,
  shouldRestock,
  shouldUpdateFoodItemStatus, // Add this import
} from "../utils/foodItemCalcUtils";

export const useFetchFoodItems = () => {
  const setFoodItems = useSetRecoilState(foodItemsState);

  return async (page, itemsPerPage) => {
    try {
      const response = await axios.get(
        `/api/food/items?page=${page}&itemsPerPage=${itemsPerPage}`
      );
      console.log("Raw API response for food items state:", response.data);

      const items = Array.isArray(response.data.data) ? response.data.data : [];

      setFoodItems(items);

      return {
        success: true,
        items,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        totalItems: response.data.totalItems,
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
      const response = await axios.post("/api/food/items", item, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(foodItemsState, (oldItems) => [...oldItems, response.data.data]);
    } catch (error) {
      console.error("Error adding food item", error);
      throw error;
    }
  });
};

export const useUpdateFoodItem = () => {
  return useRecoilCallback(({ set }) => async (id, data) => {
    try {
      const response = await axios.put(`/api/food/items/${id}`, data);
      set(foodItemsState, (oldItems) =>
        oldItems.map((item) => (item._id === id ? response.data.data : item))
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
      console.log("Attempting to delete item with ID:", id);
      const response = await axios.post(`/api/food/items/delete`, { _id: id });
      console.log("Delete response:", response);

      if (response.status === 200) {
        set(foodItemsState, (oldItems) =>
          oldItems.filter((item) => item._id !== id)
        );
        console.log("Item deleted successfully, updating state");
        return { success: true, message: "Food item deleted successfully" };
      } else {
        console.log("Unexpected response status:", response.status);
        throw new Error(
          response.data.message || "Failed to delete the food item"
        );
      }
    } catch (error) {
      console.error("Error deleting food item", error);
      return { success: false, error: error.message };
    }
  });
};

export const useUpdateFoodItemStatus = () => {
  return useRecoilCallback(({ set }) => async (id) => {
    try {
      const response = await axios.get(`/api/food/items/${id}`);
      const foodItem = response.data.data;
      const newStatus = shouldUpdateFoodItemStatus(foodItem);

      if (newStatus) {
        const updatedItem = await axios.put(`/api/food/items/${id}`, {
          status: newStatus,
          statusChangeDate: new Date(),
        });
        set(foodItemsState, (oldItems) =>
          oldItems.map((item) =>
            item._id === id ? updatedItem.data.data : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating food item status", error);
      throw error;
    }
  });
};

export const useGenerateInsights = () => {
  return useRecoilCallback(({ snapshot }) => async (startDate, endDate) => {
    try {
      const response = await axios.get("/api/food/insights", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error generating insights", error);
      throw error;
    }
  });
};

export const useCalculateWasteCost = () => {
  return useRecoilCallback(({ snapshot }) => async (startDate, endDate) => {
    try {
      const response = await axios.get("/api/food/insights/wastecost", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data.totalWasteCost;
    } catch (error) {
      console.error("Error calculating waste cost", error);
      throw error;
    }
  });
};

export const usePredictFutureWaste = () => {
  return useRecoilCallback(({ snapshot }) => async (days) => {
    try {
      const response = await axios.get("/api/food/insights/predictwaste", {
        params: { days },
      });
      return response.data.predictedWaste;
    } catch (error) {
      console.error("Error predicting future waste", error);
      throw error;
    }
  });
};

// The following functions remain unchanged as they don't involve API calls
export const useCalculateAverageConsumptionTime = () => {
  return useRecoilCallback(({ snapshot }) => async () => {
    try {
      const foodItems = await snapshot.getPromise(foodItemsState);
      return calculateAverageTimeToConsumption(foodItems);
    } catch (error) {
      console.error("Error calculating average consumption time", error);
      throw error;
    }
  });
};

export const useCalculateTurnoverRate = () => {
  return useRecoilCallback(({ snapshot }) => async (period) => {
    try {
      const foodItems = await snapshot.getPromise(foodItemsState);
      return calculateFoodTurnoverRate(foodItems, period);
    } catch (error) {
      console.error("Error calculating turnover rate", error);
      throw error;
    }
  });
};

export const useCheckRestock = () => {
  return useRecoilCallback(
    ({ snapshot }) =>
      async (foodItemId, leadTime, dailyUsage, safetyStock) => {
        try {
          const foodItems = await snapshot.getPromise(foodItemsState);
          const foodItem = foodItems.find((item) => item._id === foodItemId);
          if (!foodItem) throw new Error("Food item not found");

          const optimalReorderPoint = calculateOptimalReorderPoint(
            foodItem,
            leadTime,
            dailyUsage,
            safetyStock
          );
          return shouldRestock(foodItem, optimalReorderPoint);
        } catch (error) {
          console.error("Error checking restock", error);
          throw error;
        }
      }
  );
};
