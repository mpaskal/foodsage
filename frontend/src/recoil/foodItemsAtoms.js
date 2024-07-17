// src/recoil/foodItemsAtoms.js

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
          item.status === "Waste" || item.status === "Donate";

        let updatedItem = { ...item };

        if (expirationDate < fiveDaysAgo && !isConsumed && !isWasteOrDonation) {
          updatedItem.status = "Waste";
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
          item.status === "Waste" &&
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
          item.status === "Donate" &&
          (item.donationDate
            ? new Date(item.donationDate) > thirtyDaysAgo
            : true)
      );
  },
});

export const moveItemState = selector({
  key: "moveItemState",
  get: ({ get }) => get(foodItemsState),
  set: ({ set, get }, { itemId, newstatus }) => {
    set(foodItemsState, (prevItems) =>
      prevItems.map((item) =>
        item._id === itemId
          ? {
              ...item,
              status: newstatus,
              ...(newstatus === "Waste" && {
                wasteDate: new Date().toISOString(),
              }),
              ...(newstatus === "Donate" && {
                donationDate: new Date().toISOString(),
              }),
            }
          : item
      )
    );
  },
});

export const wasteAnalyticsState = selector({
  key: "wasteAnalyticsState",
  get: ({ get }) => {
    const wasteItems = get(wasteItemsState);

    const totalWasteCost = wasteItems.reduce(
      (sum, item) => sum + (item.cost || 0),
      0
    );
    const wasteByCategory = wasteItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    const wasteByReason = wasteItems.reduce((acc, item) => {
      const reason = item.consumed === 0 ? "Unused" : "Partially Used";
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});

    return {
      totalWasteItems: wasteItems.length,
      totalWasteCost,
      wasteByCategory,
      wasteByReason,
    };
  },
});

export const donationAnalyticsState = selector({
  key: "donationAnalyticsState",
  get: ({ get }) => {
    const donationItems = get(donationItemsState);

    const totalDonationValue = donationItems.reduce(
      (sum, item) => sum + (item.cost || 0),
      0
    );
    const donationsByCategory = donationItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalDonationItems: donationItems.length,
      totalDonationValue,
      donationsByCategory,
    };
  },
});
