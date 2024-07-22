import { useState, useCallback, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { allFoodItemsState } from "../recoil/foodItemsAtoms";
import api from "../utils/api";

export const useSavingsData = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const setAllFoodItems = useSetRecoilState(allFoodItemsState);

  const fetchSavingsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/food/items/all");
      console.log("Raw API response:", response.data);

      const items = response.data.data.map((item) => ({
        ...item,
        statusChangeDate: new Date(item.statusChangeDate),
        expirationDate: new Date(item.expirationDate),
        purchasedDate: new Date(item.purchasedDate),
      }));

      console.log("Processed items:", items);
      setAllFoodItems(items);
    } catch (error) {
      console.error("Error fetching savings data:", error);
      setError("Failed to fetch savings data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [setAllFoodItems]);

  useEffect(() => {
    fetchSavingsData();
  }, [fetchSavingsData]);

  return { error, isLoading, refetchData: fetchSavingsData };
};

export default useSavingsData;
