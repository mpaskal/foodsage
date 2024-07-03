import React, { useEffect } from "react";
import axios from "axios";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  foodItemsState,
  foodItemsWithExpirationState,
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
  const [currentItem, setCurrentItem] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);

  useEffect(() => {
    const fetchFoodItems = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/fooditems");
        if (Array.isArray(response.data.data)) {
          setFoodItemsBase(response.data.data);
        } else {
          setError("Response data is not an array");
        }
      } catch (error) {
        setError("Failed to fetch food items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodItems();
  }, [setFoodItemsBase]);

  const handleInputChange = debounce(async (itemId, field, value) => {
    if (!itemId) {
      console.error("Error updating item: Item ID is undefined");
      setError("An error occurred while updating the food item.");
      return;
    }

    try {
      setIsUpdating(true);
      let updates = { [field]: value };

      const response = await axios.put(`/api/fooditems/${itemId}`, updates);
      if (response.status === 200) {
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, ...updates } : item
          )
        );
        setFoodItemsWithExpiration((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, ...updates } : item
          )
        );
        console.log("Item updated successfully");
      } else if (response.status === 404) {
        setError(`The food item with ID ${itemId} was not found.`);
        console.error(`Error updating item: Item with ID ${itemId} not found`);
      } else {
        setError("Failed to update the food item.");
        console.error("Error updating item:", response.data);
      }
    } catch (error) {
      setError("An error occurred while updating the food item.");
      console.error("Error updating item:", error);
    } finally {
      setIsUpdating(false);
    }
  }, 300);

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
        <div className="d-flex align-items-center mb-3">
          <h1>Food Inventory</h1>
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
