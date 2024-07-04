import React, { useEffect } from "react";
import axios from "axios";
import { useRecoilState, useSetRecoilState } from "recoil";
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

const FoodItemsPage = () => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);
  const [foodItemsWithExpiration, setFoodItemsWithExpiration] = useRecoilState(
    foodItemsWithExpirationState
  );
  const setFoodItemsBase = useSetRecoilState(foodItemsState);
  const [showModal, setShowModal] = React.useState(false);
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);

  useEffect(() => {
    const fetchFoodItems = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/fooditems");
        console.log("Response received:", response.data); // Log the entire response for debugging

        if (response.data && Array.isArray(response.data)) {
          setFoodItemsBase(response.data);
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
    };

    fetchFoodItems();
  }, [setFoodItemsBase]);

  const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  };

  const currentDate = getCurrentDateFormatted();

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

      const response = await axios.patch(`/api/fooditems/${itemId}`, updates);
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
      const response = await axios.delete(`/api/fooditems/${itemId}`);
      if (response.status === 200) {
        setFoodItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        setFoodItemsWithExpiration((prevItems) =>
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
            onClick={() => setShowModal(true)}
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
            handleEdit={setShowModal}
            handleDelete={handleDeleteItem}
            isUpdating={isUpdating}
          />
        ) : (
          <p>No food items found.</p>
        )}

        {showModal && (
          <FoodItemModal
            show={showModal}
            handleClose={() => setShowModal(false)}
            currentItem={currentItem}
          />
        )}
      </div>
    </Layout>
  );
};

export default FoodItemsPage;
