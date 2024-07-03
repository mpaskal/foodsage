// foodItemAtoms.js
import { atom, selector } from "recoil";
import { calculateExpirationDate } from "../utils/dateUtils";

export const foodItemsState = atom({
  key: "foodItemsState",
  default: [],
});

export const foodItemsWithExpirationState = selector({
  key: "foodItemsWithExpirationState",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    return foodItems.map((item) => ({
      ...item,
      expirationDate: calculateExpirationDate(
        item.category,
        item.storage,
        item.purchasedDate
      ),
    }));
  },
});
