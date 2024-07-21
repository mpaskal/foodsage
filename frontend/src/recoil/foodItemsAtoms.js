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

/* Dashboard */
export const wasteAtGlanceSelector = selector({
  key: "wasteAtGlanceSelector",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    console.log("All food items in wasteAtGlanceSelector:", foodItems);

    const wastedThisMonth = foodItems.filter((item) => {
      const itemStatusChangeDate = new Date(item.statusChangeDate);
      console.log(
        `Item ${item.name}: Status: ${item.status}, Status Change Date: ${itemStatusChangeDate}`
      );
      return item.status === "Waste" && itemStatusChangeDate >= firstDayOfMonth;
    });

    console.log("Wasted items this month:", wastedThisMonth);

    const totalWastedThisMonth = wastedThisMonth.length;

    // Calculate percentage change from last month
    const lastMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );

    const wastedLastMonth = foodItems.filter((item) => {
      const itemStatusChangeDate = new Date(item.statusChangeDate);
      return (
        item.status === "Waste" &&
        itemStatusChangeDate >= lastMonthStart &&
        itemStatusChangeDate <= lastMonthEnd
      );
    });

    const percentageChange =
      wastedLastMonth.length > 0
        ? ((totalWastedThisMonth - wastedLastMonth.length) /
            wastedLastMonth.length) *
          100
        : totalWastedThisMonth > 0
        ? 100
        : 0;

    return {
      totalWastedThisMonth,
      percentageChange,
      quickTip:
        "Try implementing a FIFO (First In, First Out) system to reduce waste.",
    };
  },
});

export const moneyMattersSelector = selector({
  key: "moneyMattersSelector",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    console.log("All food items in moneyMattersSelector:", foodItems);

    const wastedThisMonth = foodItems.filter((item) => {
      const itemStatusChangeDate = new Date(item.statusChangeDate);
      console.log(
        `Item ${item.name}: Status: ${item.status}, Status Change Date: ${itemStatusChangeDate}`
      );
      return item.status === "Waste" && itemStatusChangeDate >= firstDayOfMonth;
    });

    console.log("Wasted items this month:", wastedThisMonth);

    const moneyLostThisMonth = wastedThisMonth.reduce((total, item) => {
      const lostAmount = item.cost * ((100 - item.consumed) / 100);
      console.log(
        `Item ${item.name}: Cost: ${item.cost}, Consumed: ${item.consumed}%, Lost: ${lostAmount}`
      );
      return total + lostAmount;
    }, 0);

    console.log("Total money lost this month:", moneyLostThisMonth);

    const activeItems = foodItems.filter((item) => item.status === "Active");
    const potentialSavings = activeItems.reduce((total, item) => {
      const potentialSaving = item.cost * ((100 - item.consumed) / 100);
      console.log(
        `Active item ${item.name}: Cost: ${item.cost}, Consumed: ${item.consumed}%, Potential Saving: ${potentialSaving}`
      );
      return total + potentialSaving;
    }, 0);

    console.log("Total potential savings:", potentialSavings);

    return {
      moneyLostThisMonth,
      potentialSavings,
    };
  },
});

export const inventoryStatusSelector = selector({
  key: "inventoryStatusSelector",
  get: async ({ get }) => {
    const foodItems = get(foodItemsState);
    const currentDate = new Date();
    const activeItems = foodItems.filter((item) => item.status === "Active");
    const expiringItems = activeItems.filter((item) => {
      const expirationDate = new Date(item.expirationDate);
      const daysUntilExpiration = Math.floor(
        (expirationDate - currentDate) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiration <= 3;
    });

    return {
      totalActiveItems: activeItems.length,
      itemsExpiringInThreeDays: expiringItems.length,
    };
  },
});

export const actionNeededSelector = selector({
  key: "actionNeededSelector",
  get: ({ get }) => {
    const foodItems = get(foodItemsState);
    const currentDate = new Date();
    console.log("All food items:", foodItems);
    const expiredItems = foodItems.filter((item) => {
      const expirationDate = new Date(item.expirationDate);
      return item.status === "Active" && expirationDate < currentDate;
    });
    const donationItemsNotMarked = foodItems.filter((item) => {
      const statusChangeDate = new Date(item.statusChangeDate);
      const daysSinceStatusChange = Math.floor(
        (currentDate - statusChangeDate) / (1000 * 60 * 60 * 24)
      );
      const isNotMarked = item.status === "Donation";
      console.log(
        `Item ${item._id}: status=${item.status}, daysSinceStatusChange=${daysSinceStatusChange}, isNotMarked=${isNotMarked}`
      );
      return isNotMarked;
    });

    console.log("Donation items not marked:", donationItemsNotMarked);
    // Add any other actions you want to track here
    const otherActions = foodItems.filter((item) => {
      // Example: items that are low in quantity
      return item.status === "Active" && item.quantity < 5;
    });
    return {
      expiredItemsCount: expiredItems.length,
      donationItemsNotMarkedCount: donationItemsNotMarked.length,
      otherActionsCount: otherActions.length,
    };
  },
});
