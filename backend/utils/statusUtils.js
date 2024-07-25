exports.getActionFromStatus = (newStatus, previousStatus, updatedFields) => {
  if (newStatus !== previousStatus) {
    return `changed status from ${previousStatus} to ${newStatus}`;
  }
  if (updatedFields.length > 0) {
    return `updated ${updatedFields.join(", ")}`;
  }
  return "updated";
};
