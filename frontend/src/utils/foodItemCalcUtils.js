// Helper function to calculate days between two dates
const daysBetween = (date1, date2) => {
  return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
};

// Calculate insights based on food items and waste records
export const calculateInsights = (
  foodItems,
  wasteRecords,
  startDate,
  endDate
) => {
  const totalItems = foodItems.length;
  const consumedItems = foodItems.filter(
    (item) => item.status === "Consumed"
  ).length;
  const wastedItems = foodItems.filter(
    (item) => item.status === "Waste"
  ).length;
  const donatedItems = foodItems.filter(
    (item) => item.status === "Donated"
  ).length;

  const potentialSavings = foodItems.reduce((sum, item) => sum + item.cost, 0);
  const actualSavings = foodItems
    .filter((item) => item.status === "Consumed")
    .reduce((sum, item) => sum + item.cost * (item.consumed / 100), 0);
  const moneyLost = wasteRecords.reduce(
    (sum, record) => sum + record.wasteCost,
    0
  );

  const consumptionRate = (consumedItems / totalItems) * 100;
  const wasteRate = (wastedItems / totalItems) * 100;
  const donationRate = (donatedItems / totalItems) * 100;

  const categoryBreakdown = calculateCategoryBreakdown(foodItems);
  const expirationTrend = calculateExpirationTrend(foodItems);

  return {
    totalItems,
    consumedItems,
    wastedItems,
    donatedItems,
    potentialSavings,
    actualSavings,
    moneyLost,
    consumptionRate,
    wasteRate,
    donationRate,
    categoryBreakdown,
    expirationTrend,
  };
};

// Calculate category breakdown
const calculateCategoryBreakdown = (foodItems) => {
  const breakdown = {};
  foodItems.forEach((item) => {
    if (!breakdown[item.category]) {
      breakdown[item.category] = { total: 0, wasted: 0, cost: 0 };
    }
    breakdown[item.category].total++;
    breakdown[item.category].cost += item.cost;
    if (item.status === "Waste") {
      breakdown[item.category].wasted++;
    }
  });

  Object.keys(breakdown).forEach((category) => {
    breakdown[category].wasteRate =
      (breakdown[category].wasted / breakdown[category].total) * 100;
  });

  return breakdown;
};

// Calculate expiration trend
export const calculateExpirationTrend = (foodItems) => {
  const now = new Date();
  const expiringWithin7Days = foodItems.filter(
    (item) => daysBetween(now, new Date(item.expirationDate)) <= 7
  ).length;

  const expirationRate = (expiringWithin7Days / foodItems.length) * 100;

  if (expirationRate > 30) return "high";
  if (expirationRate > 15) return "moderate";
  return "low";
};

// Generate recommendations based on insights
export const generateRecommendations = (insights) => {
  const recommendations = [];

  if (insights.consumptionRate < 70) {
    recommendations.push(
      "Consider reducing purchase quantities to minimize waste. Your current consumption rate is below 70%."
    );
  }

  if (insights.wasteRate > 20) {
    recommendations.push(
      "Your waste rate is above 20%. Try implementing a first-in-first-out (FIFO) system for food storage to reduce waste."
    );
  }

  if (insights.donationRate < 5 && insights.wasteRate > 10) {
    recommendations.push(
      "Consider increasing donations. Your current donation rate is below 5%, while waste rate is above 10%."
    );
  }

  if (insights.moneyLost > insights.actualSavings * 0.1) {
    recommendations.push(
      "Money lost to waste is significant. Review your inventory management practices to reduce financial losses."
    );
  }

  const highWasteCategories = Object.entries(insights.categoryBreakdown)
    .filter(([_, data]) => data.wasteRate > 30)
    .map(([category, _]) => category);

  if (highWasteCategories.length > 0) {
    recommendations.push(
      `Pay special attention to these high-waste categories: ${highWasteCategories.join(
        ", "
      )}. Consider adjusting purchase quantities or storage methods for these items.`
    );
  }

  if (insights.expirationTrend === "high") {
    recommendations.push(
      "A high number of items are expiring soon. Consider implementing a color-coded system to highlight items nearing expiration."
    );
  }

  return recommendations;
};

// Determine if a food item's status should be updated
export const shouldUpdateFoodItemStatus = (foodItem) => {
  const now = new Date();
  const threeDaysPastExpiration = new Date(foodItem.expirationDate);
  threeDaysPastExpiration.setDate(threeDaysPastExpiration.getDate() + 3);

  if (foodItem.status === "Active") {
    if (now > threeDaysPastExpiration) {
      if (foodItem.consumed === 0) {
        return "Waste";
      } else if (foodItem.consumed === 100) {
        return "Consumed";
      } else {
        return "Inactive";
      }
    } else if (foodItem.consumed === 100) {
      return "Consumed";
    }
  } else if (foodItem.status === "Donation" && now > threeDaysPastExpiration) {
    return "Waste";
  }

  return null; // No status change needed
};

// Calculate total waste cost for a given period
export const calculateTotalWasteCost = (wasteRecords) => {
  return wasteRecords.reduce((total, record) => total + record.wasteCost, 0);
};

// Calculate average time to consumption
export const calculateAverageTimeToConsumption = (foodItems) => {
  const consumedItems = foodItems.filter((item) => item.status === "Consumed");
  const totalDays = consumedItems.reduce(
    (sum, item) =>
      sum +
      daysBetween(
        new Date(item.purchasedDate),
        new Date(item.statusChangeDate)
      ),
    0
  );
  return totalDays / consumedItems.length;
};

// Calculate food turnover rate
export const calculateFoodTurnoverRate = (foodItems, period) => {
  const totalCost = foodItems.reduce((sum, item) => sum + item.cost, 0);
  const consumedCost = foodItems
    .filter((item) => item.status === "Consumed")
    .reduce((sum, item) => sum + item.cost, 0);
  return (consumedCost / totalCost) * (365 / period); // Annualized turnover rate
};

// Predict future waste based on historical data
export const predictFutureWaste = (wasteRecords, futureDays) => {
  const averageDailyWaste =
    calculateTotalWasteCost(wasteRecords) / wasteRecords.length;
  return averageDailyWaste * futureDays;
};

// Calculate optimal reorder point
export const calculateOptimalReorderPoint = (
  foodItem,
  leadTime,
  dailyUsage,
  safetyStock
) => {
  return dailyUsage * leadTime + safetyStock;
};

// Determine if an item should be restocked
export const shouldRestock = (foodItem, optimalReorderPoint) => {
  return foodItem.quantity <= optimalReorderPoint;
};
