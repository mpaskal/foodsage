const FoodItem = require("../models/FoodItem");
const CostSavingInsight = require("../models/CostSavingInsight");

class moneyInsightController {
  static async generateInsight(req, res) {
    const { tenantId, startDate, endDate } = req.body;
    const insight = await InsightController.generateCostSavingInsight(
      tenantId,
      startDate,
      endDate
    );
    res.json(insight);
  }

  static async generateCostSavingInsight(tenantId, startDate, endDate) {
    const foodItems = await FoodItem.find({
      tenantId,
      updatedAt: { $gte: startDate, $lte: endDate },
    });

    let totalItems = foodItems.length;
    let consumedItems = foodItems.filter(
      (item) => item.status === "Consumed"
    ).length;
    let wastedItems = foodItems.filter(
      (item) => item.status === "Waste"
    ).length;
    let donatedItems = foodItems.filter(
      (item) => item.status === "Donated"
    ).length;

    let potentialSavings = foodItems.reduce((sum, item) => sum + item.cost, 0);
    let actualSavings = foodItems
      .filter((item) => item.status === "Consumed")
      .reduce((sum, item) => sum + item.cost, 0);
    let moneyLost = foodItems
      .filter((item) => item.status === "Waste")
      .reduce((sum, item) => sum + item.cost * (1 - item.consumed / 100), 0);

    const insight = new CostSavingInsight({
      tenantId,
      description: `Cost saving insight for period ${startDate.toDateString()} to ${endDate.toDateString()}`,
      date: new Date(),
      potentialSavings,
      actualSavings,
      moneyLost,
      totalItems,
      consumedItems,
      wastedItems,
      donatedItems,
      consumptionRate: (consumedItems / totalItems) * 100,
      wasteRate: (wastedItems / totalItems) * 100,
      donationRate: (donatedItems / totalItems) * 100,
      recommendations: generateRecommendations(/* ... */),
      periodStart: startDate,
      periodEnd: endDate,
    });

    return await insight.save();
  }

  static generateRecommendations(data) {
    const recommendations = [];

    // Analyze consumption rate
    if (data.consumptionRate < 70) {
      recommendations.push(
        "Consider reducing purchase quantities to minimize waste. Your current consumption rate is below 70%."
      );
    }

    // Analyze waste rate
    if (data.wasteRate > 20) {
      recommendations.push(
        "Your waste rate is above 20%. Try implementing a first-in-first-out (FIFO) system for food storage to reduce waste."
      );
    }

    // Analyze donation rate
    if (data.donationRate < 5 && data.wasteRate > 10) {
      recommendations.push(
        "Consider increasing donations. Your current donation rate is below 5%, while waste rate is above 10%."
      );
    }

    // Analyze money lost
    if (data.moneyLost > data.actualSavings * 0.1) {
      recommendations.push(
        "Money lost to waste is significant. Review your inventory management practices to reduce financial losses."
      );
    }

    // Analyze specific categories
    if (data.categoryBreakdown) {
      const highWasteCategories = Object.entries(data.categoryBreakdown)
        .filter(([_, categoryData]) => categoryData.wasteRate > 30)
        .map(([category, _]) => category);

      if (highWasteCategories.length > 0) {
        recommendations.push(
          `Pay special attention to these high-waste categories: ${highWasteCategories.join(
            ", "
          )}. Consider adjusting purchase quantities or storage methods for these items.`
        );
      }
    }

    // Analyze expiration dates
    if (data.expirationTrend && data.expirationTrend === "increasing") {
      recommendations.push(
        "The trend shows an increase in items expiring before use. Consider implementing a color-coded system to highlight items nearing expiration."
      );
    }

    // Seasonal recommendation
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 5 && currentMonth <= 8) {
      // June to September
      recommendations.push(
        "As we're in the summer months, pay extra attention to proper refrigeration and storage of perishables to prevent premature spoilage."
      );
    }

    // If no specific recommendations, provide a general one
    if (recommendations.length === 0) {
      recommendations.push(
        "Your current food management practices are showing good results. Continue monitoring and adjusting as needed to maintain efficiency."
      );
    }

    return recommendations;
  }
}

module.exports = moneyInsightController;
