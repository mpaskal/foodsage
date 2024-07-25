function getActionFromStatus(currentStatus, previousStatus, updatedFields) {
  if (!previousStatus) {
    return "added";
  }

  if (currentStatus !== previousStatus) {
    return `changed status from ${previousStatus} to ${currentStatus}`;
  }

  if (updatedFields && updatedFields.length > 0) {
    return `updated ${updatedFields.join(", ")}`;
  }

  return "updated";
}
