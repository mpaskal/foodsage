// utils/dateUtils.js
export const calculateExpirationDate = (category, storage, purchasedDate) => {
  const purchased = new Date(purchasedDate);
  const expirationDate = new Date(purchasedDate);

  switch (category) {
    case "Dairy":
      if (storage === "Fridge") {
        expirationDate.setDate(purchased.getDate() + 7);
      } else if (storage === "Freezer") {
        expirationDate.setMonth(purchased.getMonth() + 1);
      }
      break;
    case "Fresh":
      if (storage === "Fridge") {
        expirationDate.setDate(purchased.getDate() + 5);
      } else if (storage === "Freezer") {
        expirationDate.setDate(purchased.getDate() + 30);
      }
      break;
    case "Grains and Bread":
      if (storage === "Pantry") {
        expirationDate.setMonth(purchased.getMonth() + 2);
      }
      break;
    case "Packaged and Snack Foods":
      if (storage === "Pantry") {
        expirationDate.setMonth(purchased.getMonth() + 6);
      }
      break;
    case "Frozen Goods":
      if (storage === "Freezer") {
        expirationDate.setMonth(purchased.getMonth() + 6);
      }
      break;
    case "Other":
      expirationDate.setDate(purchased.getDate() + 14);
      break;
    default:
      expirationDate = null;
  }

  return expirationDate;
};
