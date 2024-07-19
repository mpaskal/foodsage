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

/**
 * Calculates the expiration date based on the category, storage, and purchased date.
 * @param {string} category - The category of the item.
 * @param {string} storage - The storage condition of the item.
 * @param {Date|string|null} purchasedDate - The date the item was purchased.
 * @returns {string|null} - The calculated expiration date in ISO format or null if purchasedDate is invalid.
 */
export const calculateExpirationDate = (category, storage, purchasedDate) => {
  if (!purchasedDate) return null;

  const purchased = new Date(purchasedDate);
  if (isNaN(purchased.getTime())) return null; // Check for invalid date

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

  return expirationDate ? expirationDate.toISOString().split("T")[0] : null;
};

/**
 * Formats the given date in the "yyyy-mm-dd" format.
 * @param {Date|string|null} date - The date to be formatted.
 * @returns {string} - The formatted date in the "yyyy-mm-dd" format or an empty string if the date is invalid.
 */
export const formatDateForDisplay = (date) => {
  if (!date) return "";

  const localDate = new Date(date);
  if (isNaN(localDate.getTime())) return ""; // Check for invalid date

  // Adjust for timezone offset
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());

  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0"); // Removed + 1 as it's not necessary after timezone adjustment

  return `${year}-${month}-${day}`;
};

/**
 * Processes the date input from the UI and converts it to the ISO string format.
 * @param {string|null} date - The date input from the UI.
 * @returns {string} - The date in the ISO string format, or an empty string if the input is invalid.
 */
export const processDateInput = (date) => {
  if (!date) return "";

  // Construct a new date assuming the date is in YYYY-MM-DD format
  const parts = date.split("-");
  const inputDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));

  if (isNaN(inputDate.getTime())) return ""; // Check for invalid date

  return inputDate.toISOString().split("T")[0];
};

/**
 * Gets the current date in "yyyy-mm-dd" format.
 * @returns {string} - The current date in "yyyy-mm-dd" format.
 */
export const getCurrentDate = () => new Date().toISOString().split("T")[0];
