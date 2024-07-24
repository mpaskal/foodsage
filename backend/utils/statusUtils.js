exports.getActionFromStatus = (
  currentStatus,
  previousStatus,
  isFirstAction
) => {
  if (isFirstAction) {
    return "added";
  }
  if (previousStatus && currentStatus !== previousStatus) {
    return `changed status from ${previousStatus} to ${currentStatus}`;
  }
  switch (currentStatus) {
    case "Active":
      return "updated";
    case "Consumed":
      return "marked as consumed";
    case "Waste":
      return "marked as waste";
    case "Donation":
      return "marked for donation";
    case "Donated":
      return "marked as donated";
    default:
      return "updated";
  }
};
