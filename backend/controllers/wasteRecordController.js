async function createWasteRecord(foodItem, reason, quantity, percentWasted) {
  const wasteRecord = new WasteRecord({
    tenantId: foodItem.tenantId,
    foodItemId: foodItem._id,
    category: foodItem.category,
    reason: reason,
    expirationDate: foodItem.expirationDate,
    purchaseDate: foodItem.purchasedDate,
    wasteCost: foodItem.cost * (percentWasted / 100),
    quantity: quantity,
    quantityUnit: foodItem.quantityMeasurement,
    percentWasted: percentWasted,
  });

  const preventionRecommendations =
    wasteRecord.generatePreventionRecommendations();
  wasteRecord.preventionSteps = preventionRecommendations;

  await wasteRecord.save();

  return wasteRecord;
}
