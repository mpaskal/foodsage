import { useRecoilState } from "recoil";
import { foodItemsState } from "../recoil/foodItemsAtoms";
import { useCallback } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";

export const useFoodItemManagement = () => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);

  const handleInputChange = useCallback(
    async (itemId, field, value) => {
      if (!itemId) {
        console.error("Error updating item: Item ID is undefined");
        toast.error("An error occurred while updating the food item.");
        return;
      }

      setFoodItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, [field]: value } : item
        )
      );

      try {
        let updates = { [field]: value };

        if (field === "consumed") {
          const numericValue = parseInt(value, 10);
          updates.consumed = numericValue;
          updates.moveTo = numericValue === 100 ? "Consumed" : "Consume";
        }

        if (field === "moveTo" || updates.moveTo) {
          const newMoveTo = updates.moveTo || value;
          updates.moveTo = newMoveTo;
          if (newMoveTo === "Waste") {
            updates.wasteDate = new Date().toISOString();
          } else if (newMoveTo === "Donate") {
            updates.donationDate = new Date().toISOString();
          }
        }

        const response = await api.post(`/foodItems/${itemId}`, updates);

        if (response.status === 200) {
          setFoodItems((prevItems) =>
            prevItems.map((item) =>
              item._id === itemId ? { ...item, ...updates } : item
            )
          );

          if (updates.moveTo) {
            toast.success(`Item moved to ${updates.moveTo}`);
          } else {
            toast.success("Item updated successfully");
          }
        } else {
          throw new Error("Failed to update the food item.");
        }
      } catch (error) {
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, [field]: item[field] } : item
          )
        );
        toast.error("An error occurred while updating the food item.");
        console.error("Error updating item:", error);
      }
    },
    [setFoodItems]
  );

  const handleDeleteItem = useCallback(
    async (itemId) => {
      try {
        const response = await api.delete(`/foodItems/${itemId}`);
        if (response.status === 200) {
          setFoodItems((prevItems) =>
            prevItems.filter((item) => item._id !== itemId)
          );
          toast.success("Item deleted successfully");
        } else if (response.status === 404) {
          toast.error(`The food item with ID ${itemId} was not found.`);
        } else {
          toast.error("Failed to delete the food item.");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the food item.");
        console.error("Error deleting item:", error);
      }
    },
    [setFoodItems]
  );

  return {
    foodItems,
    handleInputChange,
    handleDeleteItem,
  };
};
