import React, { useEffect, useCallback, useState } from "react";
import api from "../../utils/api"; // Import the custom Axios instance
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
import { formatDateForDisplay, processDateInput } from "../../utils/dateUtils";

const FoodItemsPage = () => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);
  const foodItemsWithExpiration = useRecoilValue(foodItemsWithExpirationState);
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchFoodItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/fooditems"); // Use custom Axios instance
      if (response.data && Array.isArray(response.data.data)) {
        setFoodItems(response.data.data);
      } else {
        console.error("Unexpected response structure:", response.data);
        setError("Unexpected response structure");
      }
    } catch (error) {
      console.error("Error fetching food items:", error);
      setError(
        "Failed to fetch food items: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  }, [setFoodItems]);

  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

  const handleInputChange = debounce(async (itemId, field, value) => {
    if (!itemId) {
      console.error("Error updating item: Item ID is undefined");
      setError("An error occurred while updating the food item.");
      return;
    }

    // Optimistic update
    setFoodItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, [field]: value } : item
      )
    );

    try {
      setIsUpdating(true);
      let updates = { [field]: value };

      const response = await api.patch(`/fooditems/${itemId}`, updates); // Use custom Axios instance
      if (response.status !== 200) {
        // Revert the optimistic update if the server request fails
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, [field]: item[field] } : item
          )
        );
        setError("Failed to update the food item.");
        console.error("Error updating item:", response.data);
      }
    } catch (error) {
      // Revert the optimistic update if the server request fails
      setFoodItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, [field]: item[field] } : item
        )
      );
      setError("An error occurred while updating the food item.");
      console.error("Error updating item:", error);
    } finally {
      setIsUpdating(false);
    }
  }, 150);

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await api.delete(`/fooditems/${itemId}`); // Use custom Axios instance
      if (response.status === 200) {
        setFoodItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        console.log("Item deleted successfully");
      } else if (response.status === 404) {
        setError(`The food item with ID ${itemId} was not found.`);
        console.error(`Error deleting item: Item with ID ${itemId} not found`);
      } else {
        setError("Failed to delete the food item.");
        console.error("Error deleting item:", response.data);
      }
    } catch (error) {
      setError("An error occurred while deleting the food item.");
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
      }); // Use custom Axios instance

      if (response.status === 201) {
        setFoodItems((prevItems) => [...prevItems, response.data]);
        setShowModal(false);
        setCurrentItem(null);
        fetchFoodItems(); // Refresh the list after adding
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
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("No response received from the server. Please try again.");
      } else {
        console.error("Error setting up request:", error.message);
        setError(
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
          <Alert variant="danger">
            <strong>Error:</strong> {error}
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
