import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import axios from "axios";
import { foodItemsState } from "../recoil/foodItemsAtoms";
import { calculateExpirationDate } from "../utils/dateUtils";

export const useFetchFoodItems = () => {
  const setFoodItems = useSetRecoilState(foodItemsState);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("/api/food/items");
        setFoodItems(
          response.data.map((item) => ({
            ...item,
            expirationDate: new Date(
              calculateExpirationDate(
                item.category,
                item.storage,
                item.purchasedDate
              )
            ),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    };

    fetchItems();
  }, [setFoodItems]);
};
