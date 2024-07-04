// utils/dateUtils.js

/**
 * Calculates the expiration date based on the category, storage, and purchased date.
 * @param {string} category - The category of the item.
 * @param {string} storage - The storage condition of the item.
 * @param {Date} purchasedDate - The date the item was purchased.
 * @returns {Date} - The calculated expiration date.
 */
export const calculateExpirationDate = (category, storage, purchasedDate) => {
  const purchased = new Date(purchasedDate);
  let expirationDate = new Date(purchasedDate); // Initialize with purchased date

  // Define expiration logic based on category and storage
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
      expirationDate = null;
  }

  return expirationDate;
};

/**
 * Formats the given date in the "yyyy-mm-dd" format.
 * @param {Date} date - The date to be formatted.
 * @returns {string} - The formatted date in the "yyyy-mm-dd" format.
 */
export const formatDateForDisplay = (date) => {
  console.log("date in db", date);
  if (!date) return "";

  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());

  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate() + 1).padStart(2, "0");
  console.log("date in db formatted", `${year}-${month}-${day}`);

  return `${year}-${month}-${day}`;
};

/**
 * Processes the date input from the UI and converts it to the ISO string format.
 * @param {string} date - The date input from the UI.
 * @returns {string} - The date in the ISO string format, or an empty string if the input is invalid.
 */
export const processDateInput = (date) => {
  console.log("date input", date);
  if (!date) return "";

  // Construct a new date assuming the date is in YYYY-MM-DD format
  const parts = date.split("-");
  const inputDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));

  console.log("date for db", inputDate.toISOString());
  return inputDate.toISOString();
};
