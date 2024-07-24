import { useState, useCallback, useMemo } from "react";
import api from "../utils/api";
import {
  calculateExpirationDate,
  formatDateForDisplay,
} from "../utils/dateUtils";

export const useFoodItemsFetching = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const processItem = useCallback(
    (item) => ({
      ...item,
      expirationDate: calculateExpirationDate(
        item.category,
        item.storage,
        item.purchasedDate
      ),
      purchasedDate: formatDateForDisplay(new Date(item.purchasedDate)),
      ...(item.expirationDate && {
        expirationDate: formatDateForDisplay(new Date(item.expirationDate)),
      }),
      updatedByName: item.updatedBy
        ? `${item.updatedBy.firstName} ${item.updatedBy.lastName}`
        : "Unknown User",
      // Add this line to process the activityLog
      activityLog: item.activityLog || [],
    }),
    []
  );

  const fetchAllFoodItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/food/items/all");
      const itemsArray = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      if (!Array.isArray(itemsArray)) {
        throw new Error("Invalid data structure received from the server");
      }

      const processedItems = itemsArray.map(processItem);
      setFoodItems(processedItems);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [processItem]);

  const memoizedFoodItems = useMemo(() => foodItems, [foodItems]);

  return { foodItems: memoizedFoodItems, isLoading, error, fetchAllFoodItems };
};
