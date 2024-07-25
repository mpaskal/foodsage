/**
 * Calculates the number of days since the expiration date.
 * @param {Date|string} expirationDate - The expiration date of the item.
 * @returns {number} - The number of days since the expiration date (negative if not yet expired).
 */
export const getDaysSinceExpiration = (expirationDate) => {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const timeDiff = today - expDate;
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

export const getDaysSinceStatusChange = (statusChangeDate) => {
  const now = new Date();
  const changeDate = new Date(statusChangeDate);
  const diffTime = Math.abs(now - changeDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateExpirationDate = (category, storage, purchasedDate) => {
  if (!purchasedDate) return "";

  const purchased = new Date(purchasedDate);
  if (isNaN(purchased.getTime())) return "";

  let expirationDate = new Date(purchased);

  switch (category) {
    case "Dairy":
      expirationDate.setDate(
        purchased.getDate() +
          (storage === "Fridge"
            ? 7
            : storage === "Freezer"
            ? 90
            : storage === "Pantry"
            ? 3
            : 5)
      );
      break;
    case "Fresh":
      expirationDate.setDate(
        purchased.getDate() +
          (storage === "Fridge"
            ? 5
            : storage === "Freezer"
            ? 30
            : storage === "Pantry"
            ? 3
            : 7)
      );
      break;
    case "Grains and Bread":
      expirationDate.setMonth(
        purchased.getMonth() +
          (storage === "Pantry"
            ? 2
            : storage === "Fridge"
            ? 3
            : storage === "Freezer"
            ? 6
            : 4)
      );
      break;
    case "Packaged and Snack Foods":
      expirationDate.setMonth(
        purchased.getMonth() +
          (storage === "Pantry"
            ? 6
            : storage === "Fridge"
            ? 8
            : storage === "Freezer"
            ? 12
            : 7)
      );
      break;
    case "Frozen Goods":
      expirationDate.setMonth(
        purchased.getMonth() + (storage === "Freezer" ? 6 : 1)
      );
      break;
    case "Other":
      expirationDate.setMonth(
        purchased.getMonth() +
          (storage === "Fridge"
            ? 1
            : storage === "Freezer"
            ? 3
            : storage === "Pantry"
            ? 1
            : 2)
      );
      break;
    default:
      expirationDate.setDate(purchased.getDate() + 7); // Default to 7 days if no specific rule
  }
  return expirationDate.toISOString().split("T")[0];
};

export const formatDateForDisplay = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

export const processDateInput = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toISOString();
};

export const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

export const getCurrentDateFormatted = () => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date().toLocaleDateString("en-US", options);
};

export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};
