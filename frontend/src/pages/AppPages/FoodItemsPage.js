import React, { useEffect, useCallback, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  foodItemsState,
  foodItemsWithExpirationState,
  currentItemState,
} from "../../recoil/foodItemsAtoms";
import Layout from "../../components/Layout/LayoutApp";
import FoodItemTable from "../../components/FoodItem/FoodItemTable";
import FoodItemModal from "../../components/FoodItem/FoodItemModal";
import { Button, Alert, Spinner } from "react-bootstrap";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { formatDateForDisplay, processDateInput } from "../../utils/dateUtils";

const FoodItemsPage = () => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);
  const foodItemsWithExpiration = useRecoilValue(foodItemsWithExpirationState);
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  const fetchFoodItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/fooditems");
      if (response.data && Array.isArray(response.data.data)) {
        const currentDate = new Date();
        const fiveDaysAgo = new Date(
          currentDate.getTime() - 5 * 24 * 60 * 60 * 1000
        );

        const filteredItems = response.data.data.filter((item) => {
          const expirationDate = new Date(item.expirationDate);
          return (
            item.moveTo !== "Waste" &&
            item.moveTo !== "Donate" &&
            (expirationDate > fiveDaysAgo || item.consumed === 100)
          );
        });

        setFoodItems(filteredItems);
      } else {
        // ... error handling
      }
    } catch (error) {
      // ... error handling
    } finally {
      setIsLoading(false);
    }
  }, [setFoodItems, navigate]);

  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

  const handleInputChange = debounce(async (itemId, field, value) => {
    if (!itemId) {
      console.error("Error updating item: Item ID is undefined");
      setError("An error occurred while updating the food item.");
      toast.error("An error occurred while updating the food item.");
      return;
    }

    setFoodItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );

    try {
      setIsUpdating(true);
      let updates = { [field]: value };

      const response = await api.post(`/fooditems/${itemId}`, updates);
      if (response.status !== 200) {
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, [field]: item[field] } : item
          )
        );
        setError("Failed to update the food item.");
        toast.error("Failed to update the food item.");
        console.error("Error updating item:", response.data);
      }
    } catch (error) {
      setFoodItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, [field]: item[field] } : item
        )
      );
      setError("An error occurred while updating the food item.");
      toast.error("An error occurred while updating the food item.");
      console.error("Error updating item:", error);
    } finally {
      setIsUpdating(false);
    }
  }, 150);

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await api.delete(`/fooditems/${itemId}`);
      if (response.status === 200) {
        setFoodItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        toast.success("Item deleted successfully");
      } else if (response.status === 404) {
        setError(`The food item with ID ${itemId} was not found.`);
        toast.error(`The food item with ID ${itemId} was not found.`);
        console.error(`Error deleting item: Item with ID ${itemId} not found`);
      } else {
        setError("Failed to delete the food item.");
        toast.error("Failed to delete the food item.");
        console.error("Error deleting item:", response.data);
      }
    } catch (error) {
      setError("An error occurred while deleting the food item.");
      toast.error("An error occurred while deleting the food item.");
      console.error("Error deleting item:", error);
    }
  };

  const handleSubmit = async (newItem) => {
    try {
      setIsUpdating(true);
      const formData = new FormData();
      for (const key in newItem) {
        if (key === "image" && newItem[key] instanceof File) {
          formData.append(key, newItem[key], newItem[key].name);
        } else {
          formData.append(key, newItem[key]);
        }
      }

      console.log("Sending data to server:", Object.fromEntries(formData));

      const response = await api.post("/fooditems", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        setFoodItems((prevItems) => [...prevItems, response.data]);
        setShowModal(false);
        setCurrentItem(null);
        fetchFoodItems();
        toast.success("Food item added successfully");
      } else {
        throw new Error("Failed to add the food item.");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        setError(
          "Failed to add the food item: " +
            (error.response.data.message || error.response.statusText)
        );
        toast.error(
          "Failed to add the food item: " +
            (error.response.data.message || error.response.statusText)
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("No response received from the server. Please try again.");
        toast.error("No response received from the server. Please try again.");
      } else {
        console.error("Error setting up request:", error.message);
        setError(
          "An error occurred while setting up the request: " + error.message
        );
        toast.error(
          "An error occurred while setting up the request: " + error.message
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  };

  const currentDate = getCurrentDateFormatted();

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="title">Food Inventory</h1>
          <h2>{currentDate}</h2>
        </div>
        <div className="d-flex justify-content-end mb-1">
          <Button
            variant="success"
            className="ml-auto"
            onClick={() => {
              setCurrentItem(null);
              setShowModal(true);
            }}
          >
            Add Food Item
          </Button>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}
        {isLoading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : foodItemsWithExpiration.length > 0 ? (
          <FoodItemTable
            foodItems={foodItemsWithExpiration}
            handleInputChange={handleInputChange}
            handleEdit={(item) => {
              setCurrentItem(item);
              setShowModal(true);
            }}
            handleDelete={handleDeleteItem}
            isUpdating={isUpdating}
          />
        ) : (
          <p>No food items found.</p>
        )}

        {showModal && (
          <FoodItemModal
            show={showModal}
            handleClose={() => {
              setShowModal(false);
              setCurrentItem(null);
            }}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
    </Layout>
  );
};

export default FoodItemsPage;
