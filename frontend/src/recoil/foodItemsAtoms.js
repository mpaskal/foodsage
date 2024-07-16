import { atom, selector } from "recoil";
import {
  calculateExpirationDate,
  formatDateForDisplay,
} from "../utils/dateUtils";

export const foodItemsState = atom({
  key: "foodItemsState",
  default: [],
});

export const currentItemState = atom({
  key: "currentItemState",
  default: null,
});

export const foodItemsWithExpirationState = selector({
  key: "foodItemsWithExpirationState",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    const currentDate = new Date();
    const fiveDaysAgo = new Date(
      currentDate.getTime() - 5 * 24 * 60 * 60 * 1000
    );

    return foodItems
      .map((item) => {
        const calculatedExpirationDate = calculateExpirationDate(
          item.category,
          item.storage,
          item.purchasedDate
        );
        const expirationDate = new Date(calculatedExpirationDate);
        const isExpired = expirationDate < currentDate;
        const isConsumed = item.consumed === 100;
        const isWasteOrDonation =
          item.moveTo === "Waste" || item.moveTo === "Donate";

        // Create a new object instead of modifying the existing one
        let updatedItem = { ...item };

        // If expired for more than 5 days and not consumed/moved, mark as waste
        if (expirationDate < fiveDaysAgo && !isConsumed && !isWasteOrDonation) {
          updatedItem.moveTo = "Waste";
        }

        return {
          ...updatedItem,
          expirationDate: formatDateForDisplay(calculatedExpirationDate),
          isVisible:
            !isWasteOrDonation && !isConsumed && expirationDate > fiveDaysAgo,
        };
      })
      .filter((item) => item.isVisible);
  },
});

export const wasteItemsState = selector({
  key: "wasteItemsState",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    const thirtyDaysAgo = new Date(
      new Date().getTime() - 30 * 24 * 60 * 60 * 1000
    );

    return foodItems
      .map((item) => ({
        ...item,
        expirationDate: formatDateForDisplay(
          calculateExpirationDate(
            item.category,
            item.storage,
            item.purchasedDate
          )
        ),
      }))
      .filter(
        (item) =>
          item.moveTo === "Waste" &&
          (item.wasteDate
            ? new Date(item.wasteDate) > thirtyDaysAgo
            : new Date(item.expirationDate) > thirtyDaysAgo)
      );
  },
});

export const donationItemsState = selector({
  key: "donationItemsState",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    const thirtyDaysAgo = new Date(
      new Date().getTime() - 30 * 24 * 60 * 60 * 1000
    );

    return foodItems
      .map((item) => ({
        ...item,
        expirationDate: formatDateForDisplay(
          calculateExpirationDate(
            item.category,
            item.storage,
            item.purchasedDate
          )
        ),
      }))
      .filter(
        (item) =>
          item.moveTo === "Donate" &&
          (item.donationDate
            ? new Date(item.donationDate) > thirtyDaysAgo
            : true)
      );
  },
});

export const moveItemState = selector({
  key: "moveItemState",
  get: ({ get }) => get(foodItemsState),
  set: ({ set, get }, { itemId, newMoveTo }) => {
    set(foodItemsState, (prevItems) =>
      prevItems.map((item) =>
        item._id === itemId
          ? {
              ...item,
              moveTo: newMoveTo,
              ...(newMoveTo === "Waste" && {
                wasteDate: new Date().toISOString(),
              }),
              ...(newMoveTo === "Donate" && {
                donationDate: new Date().toISOString(),
              }),
            }
          : item
      )
    );
  },
});
