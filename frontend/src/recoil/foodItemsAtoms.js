// src/recoil/foodItemsAtoms.js

import { atom, selector } from "recoil";
import {
  calculateExpirationDate,
  formatDateForDisplay,
  getDaysSinceExpiration,
} from "../utils/dateUtils";

export const foodItemsState = atom({
  key: "foodItemsState",
  default: [],
});

export const currentItemState = atom({
  key: "currentItemState",
  default: null,
});

export const activeFoodItemsSelector = selector({
  key: "activeFoodItemsSelector",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    console.log("All food items in activeFoodItemsSelector:", foodItems);

    const activeItems = foodItems.filter((item) => {
      const daysSinceExpiration = getDaysSinceExpiration(item.expirationDate);
      return (
        item.status !== "Waste" &&
        item.status !== "Donation" &&
        (daysSinceExpiration <= 5 || item.consumed < 100)
      );
    });

    console.log("Filtered active food items:", activeItems);
    return activeItems;
  },
});

export const wasteItemsSelector = selector({
  key: "wasteItemsSelector",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    console.log("All food items in wasteItemsSelector:", foodItems);

    const wasteItems = foodItems.filter((item) => {
      const daysSinceExpiration = getDaysSinceExpiration(item.expirationDate);
      return item.status === "Waste" && daysSinceExpiration <= 30;
    });

    console.log("Filtered waste items:", wasteItems);
    return wasteItems;
  },
});

export const donationItemsSelector = selector({
  key: "donationItemsSelector",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    console.log("All food items in donationItemsSelector:", foodItems);

    const donationItems = foodItems.filter((item) => {
      const daysSinceDonation =
        (new Date() - new Date(item.lastStateChangeDate)) /
        (1000 * 60 * 60 * 24);
      return (
        (item.status === "Donation" || item.status === "Donated") &&
        daysSinceDonation <= 30
      );
    });

    console.log("Filtered donation items:", donationItems);
    return donationItems;
  },
});

export const moveItemState = selector({
  key: "moveItemState",
  get: ({ get }) => get(foodItemsState),
  set: ({ set }, { itemId, newStatus }) => {
    set(foodItemsState, (prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item._id === itemId
          ? {
              ...item,
              status: newStatus,
              lastStateChangeDate: new Date().toISOString(),
              ...(newStatus === "Waste" && {
                wasteDate: new Date().toISOString(),
              }),
              ...(newStatus === "Donation" && {
                donationDate: new Date().toISOString(),
              }),
            }
          : item
      );
      console.log("Updated items after move:", updatedItems);
      return updatedItems;
    });
  },
});

export const foodItemsWithCalculatedDates = selector({
  key: "foodItemsWithCalculatedDates",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    return foodItems.map((item) => ({
      ...item,
      expirationDate: calculateExpirationDate(
        item.category,
        item.storage,
        item.purchasedDate
      ),
      formattedExpirationDate: formatDateForDisplay(
        calculateExpirationDate(item.category, item.storage, item.purchasedDate)
      ),
      formattedPurchasedDate: formatDateForDisplay(item.purchasedDate),
    }));
  },
});

export const foodItemsStats = selector({
  key: "foodItemsStats",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    const totalItems = foodItems.length;
    const activeItems = foodItems.filter(
      (item) => item.status !== "Waste" && item.status !== "Donation"
    ).length;
    const wasteItems = foodItems.filter(
      (item) => item.status === "Waste"
    ).length;
    const donationItems = foodItems.filter(
      (item) => item.status === "Donation" || item.status === "Donated"
    ).length;

    return {
      totalItems,
      activeItems,
      wasteItems,
      donationItems,
    };
  },
});
