import { atom, selector } from "recoil";
import {
  calculateExpirationDate,
  formatDateForDisplay,
  getDaysSinceExpiration,
  getDaysSinceStatusChange,
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
        item.status === "Active" &&
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
      const daysSinceStatusChange = getDaysSinceStatusChange(
        item.statusChangeDate
      );
      return item.status === "Waste" && daysSinceStatusChange <= 30;
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
      const daysSinceStatusChange = getDaysSinceStatusChange(
        item.statusChangeDate
      );
      return (
        (item.status === "Donation" || item.status === "Donated") &&
        daysSinceStatusChange <= 30
      );
    });

    console.log("Filtered donation items:", donationItems);
    return donationItems;
  },
});

export const activeDonationItemsSelector = selector({
  key: "activeDonationItemsSelector",
  get: ({ get }) => {
    const donationItems = get(donationItemsSelector);
    return donationItems.filter((item) => item.status === "Donation");
  },
});

export const donatedItemsSelector = selector({
  key: "donatedItemsSelector",
  get: ({ get }) => {
    const donationItems = get(donationItemsSelector);
    return donationItems.filter((item) => item.status === "Donated");
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
              statusChangeDate: new Date().toISOString(),
              ...(newStatus === "Consumed" && { consumed: 100 }),
              ...(newStatus === "Donated" && {
                donatedDate: new Date().toISOString(),
              }),
            }
          : item
      );
      console.log("Updated items after change status:", updatedItems);
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
      formattedStatusChangeDate: formatDateForDisplay(item.statusChangeDate),
      formattedDonatedDate: item.donatedDate
        ? formatDateForDisplay(item.donatedDate)
        : null,
    }));
  },
});

export const foodItemsStats = selector({
  key: "foodItemsStats",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    const totalItems = foodItems.length;
    const activeItems = foodItems.filter(
      (item) => item.status === "Active"
    ).length;
    const wasteItems = foodItems.filter(
      (item) => item.status === "Waste"
    ).length;
    const donationItems = foodItems.filter(
      (item) => item.status === "Donation"
    ).length;
    const donatedItems = foodItems.filter(
      (item) => item.status === "Donated"
    ).length;
    const consumedItems = foodItems.filter(
      (item) => item.status === "Consumed"
    ).length;

    return {
      totalItems,
      activeItems,
      wasteItems,
      donationItems,
      donatedItems,
      consumedItems,
    };
  },
});
