const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    quantity: { type: Number, required: true },
    quantityMeasurement: { type: String, required: true },
    storage: { type: String, required: true, index: true },
    cost: { type: Number, required: true },
    source: { type: String, required: true, index: true },
    expirationDate: { type: Date, required: true, index: true },
    purchasedDate: { type: Date, required: true, index: true },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    category: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
    indexes: [{ fields: ["tenantId", "category"], unique: false }],
  }
);

FoodItem.createIndex({ name: 1 });
FoodItem.createIndex({ category: 1 });
