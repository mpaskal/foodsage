// foodItemsAtoms.js
import { atom, selector } from "recoil";
import {
  calculateExpirationDate,
  formatDateForDisplay,
} from "../utils/dateUtils";

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
      expirationDate: formatDateForDisplay(
        calculateExpirationDate(item.category, item.storage, item.purchasedDate)
      ),
    }));
  },
});

export const currentItemState = atom({
  key: "currentItemState",
  default: null,
});
