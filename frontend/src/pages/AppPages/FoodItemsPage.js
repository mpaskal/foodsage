import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import {
  foodItemsState,
  foodItemsWithExpirationState,
  currentItemState,
} from "../../recoil/foodItemsAtoms";
import { useFoodItemManagement } from "../../hooks/useFoodItemManagement";
import Layout from "../../components/Layout/LayoutApp";
import FoodItemTable from "../../components/FoodItem/FoodItemTable";
import FoodItemModal from "../../components/FoodItem/FoodItemModal";
import { Button, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { debounce } from "lodash";
import { formatDateForDisplay, processDateInput } from "../../utils/dateUtils";
import { format } from "date-fns"; // Add this line

// ... rest of your code

const FoodItemsPage = () => {
  const setFoodItems = useSetRecoilState(foodItemsState);
  const foodItemsWithExpiration = useRecoilValue(foodItemsWithExpirationState);
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { error, setError, fetchItems, handleInputChange, handleDeleteItem } =
    useFoodItemManagement("food");

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = useCallback(
    async (newItem) => {
      try {
        setIsUpdating(true);
        const formData = new FormData();
        for (const key in newItem) {
          if (key === "image" && newItem[key] instanceof File) {
            formData.append(key, newItem[key], newItem[key].name);
          } else if (key === "purchasedDate" || key === "expirationDate") {
            // Format dates to 'yyyy-MM-dd'
            const formattedDate = format(new Date(newItem[key]), "yyyy-MM-dd");
            formData.append(key, formattedDate);
          } else {
            formData.append(key, newItem[key]);
          }
        }

        const response = await api.post("/food/items", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 201) {
          setFoodItems((prevItems) => [...prevItems, response.data]);
          setShowModal(false);
          setCurrentItem(null);
          fetchItems();
          toast.success("Food item added successfully");
        } else {
          throw new Error("Failed to add the food item.");
        }
      } catch (error) {
        console.error("Error adding item:", error);
        const errorMessage = error.response?.data?.message || error.message;
        setError("Failed to add the food item: " + errorMessage);
        toast.error("Failed to add the food item: " + errorMessage);
      } finally {
        setIsUpdating(false);
      }
    },
    [setFoodItems, setCurrentItem, fetchItems, setError]
  );

  const getCurrentDateFormatted = useCallback(() => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  }, []);

  const currentDate = useMemo(
    () => getCurrentDateFormatted(),
    [getCurrentDateFormatted]
  );

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
        {!foodItemsWithExpiration ? (
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
            setError={setError} // Add this line
          />
        )}
      </div>
    </Layout>
  );
};

export default FoodItemsPage;
