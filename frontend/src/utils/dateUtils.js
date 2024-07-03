// utils/dateUtils.js
export const calculateExpirationDate = (category, storage, purchasedDate) => {
  const purchased = new Date(purchasedDate);
  let expirationDate = new Date(purchasedDate); // Changed to 'let' to allow modifications

  switch (category) {
    case "Dairy":
      if (storage === "Fridge") {
        expirationDate.setDate(purchased.getDate() + 7); // 1 week
      } else if (storage === "Freezer") {
        expirationDate.setMonth(purchased.getMonth() + 3); // 3 months
      } else if (storage === "Pantry") {
        expirationDate.setDate(purchased.getDate() + 3); // 3 days
      } else if (storage === "Cellar") {
        expirationDate.setDate(purchased.getDate() + 5); // 5 days
      }
      break;
    case "Fresh":
      if (storage === "Fridge") {
        expirationDate.setDate(purchased.getDate() + 5); // 5 days
      } else if (storage === "Freezer") {
        expirationDate.setDate(purchased.getDate() + 30); // 1 month
      } else if (storage === "Pantry") {
        expirationDate.setDate(purchased.getDate() + 3); // 3 days
      } else if (storage === "Cellar") {
        expirationDate.setDate(purchased.getDate() + 7); // 1 week
      }
      break;
    case "Grains and Bread":
      if (storage === "Pantry") {
        expirationDate.setMonth(purchased.getMonth() + 2); // 2 months
      } else if (storage === "Fridge") {
        expirationDate.setMonth(purchased.getMonth() + 3); // 3 months
      } else if (storage === "Freezer") {
        expirationDate.setMonth(purchased.getMonth() + 6); // 6 months
      } else if (storage === "Cellar") {
        expirationDate.setMonth(purchased.getMonth() + 4); // 4 months
      }
      break;
    case "Packaged and Snack Foods":
      if (storage === "Pantry") {
        expirationDate.setMonth(purchased.getMonth() + 6); // 6 months
      } else if (storage === "Fridge") {
        expirationDate.setMonth(purchased.getMonth() + 8); // 8 months
      } else if (storage === "Freezer") {
        expirationDate.setMonth(purchased.getMonth() + 12); // 12 months
      } else if (storage === "Cellar") {
        expirationDate.setMonth(purchased.getMonth() + 7); // 7 months
      }
      break;
    case "Frozen Goods":
      if (storage === "Freezer") {
        expirationDate.setMonth(purchased.getMonth() + 6); // 6 months
      } else if (storage === "Fridge") {
        expirationDate.setDate(purchased.getDate() + 2); // 2 days
      } else if (storage === "Pantry") {
        expirationDate.setDate(purchased.getDate() + 2); // 2 days
      } else if (storage === "Cellar") {
        expirationDate.setDate(purchased.getDate() + 2); // 2 days
      }
      break;
    case "Other":
      if (storage === "Fridge") {
        expirationDate.setDate(purchased.getDate() + 14); // 2 weeks
      } else if (storage === "Freezer") {
        expirationDate.setMonth(purchased.getMonth() + 3); // 3 months
      } else if (storage === "Pantry") {
        expirationDate.setMonth(purchased.getMonth() + 1); // 1 month
      } else if (storage === "Cellar") {
        expirationDate.setMonth(purchased.getMonth() + 2); // 2 months
      }
      break;
    default:
      expirationDate = null;
  }

  return expirationDate;
};
