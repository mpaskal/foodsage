import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  allFoodItemsState,
  activeFoodItemsSelector,
  foodItemsWithCalculatedDates,
} from "../../recoil/foodItemsAtoms";
import { useFoodItemManagement } from "../../hooks/useFoodItemManagement";
import Layout from "../../components/Layout/LayoutApp";
import FoodItemTable from "../../components/FoodItem/FoodItemTable";
import { Button, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import ErrorBoundary from "../../components/Common/ErrorBoundary";
import { formatDateForDisplay } from "../../utils/dateUtils";
import api from "../../utils/api";
import { getCurrentDateFormatted } from "../../utils/dateUtils";

const FoodItemModal = React.lazy(() =>
  import("../../components/FoodItem/FoodItemModal")
);

const ERROR_MESSAGES = {
  FAILED_TO_ADD: "Failed to add the food item",
  FAILED_TO_DELETE: "Failed to delete the food item",
};

const FoodItemsPage = () => {
  const currentDate = getCurrentDateFormatted();
  const setAllFoodItems = useSetRecoilState(allFoodItemsState);
  const activeFoodItems = useRecoilValue(activeFoodItemsSelector);
  const [currentItem, setCurrentItem] = useState(null);
  const { error, isLoading, fetchItems, handleInputChange, handleDeleteItem } =
    useFoodItemManagement("food");

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = useCallback(
    async (newItem) => {
      try {
        const formData = new FormData();
        for (const key in newItem) {
          if (key === "image" && newItem[key] instanceof File) {
            formData.append(key, newItem[key], newItem[key].name);
          } else if (key === "purchasedDate" || key === "expirationDate") {
            let date;
            if (newItem[key] instanceof Date) {
              date = newItem[key];
            } else if (typeof newItem[key] === "string") {
              date = new Date(newItem[key]);
            } else {
              throw new Error(`Invalid ${key} provided: ${newItem[key]}`);
            }

            if (isNaN(date.getTime())) {
              throw new Error(`Invalid ${key} provided: ${newItem[key]}`);
            }
            const formattedDate = formatDateForDisplay(date);
            formData.append(key, formattedDate);
          } else {
            formData.append(key, newItem[key]);
          }
        }

        const response = await api.post("/food/items", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 201) {
          setAllFoodItems((prevItems) => [...prevItems, response.data]);
          setCurrentItem(null);
          fetchItems();
          toast.success("Food item added successfully");
        } else {
          throw new Error("Failed to add the food item.");
        }
      } catch (error) {
        console.error("Error adding item:", error);
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`${ERROR_MESSAGES.FAILED_TO_ADD}: ${errorMessage}`);
      }
    },
    [setAllFoodItems, fetchItems]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        const result = await handleDeleteItem(id);
        if (result && result.success) {
          toast.success(result.message);
          fetchItems(); // Refetch items after successful deletion
        } else {
          toast.error(result ? result.error : ERROR_MESSAGES.FAILED_TO_DELETE);
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error(ERROR_MESSAGES.FAILED_TO_DELETE);
      }
    },
    [handleDeleteItem, fetchItems]
  );

  return (
    <ErrorBoundary>
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
              onClick={() => setCurrentItem({})}
            >
              Add Food Item
            </Button>
          </div>

          {error && (
            <Alert variant="danger" dismissible>
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}
          {isLoading ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : activeFoodItems.length > 0 ? (
            <FoodItemTable
              foodItems={activeFoodItems}
              handleInputChange={handleInputChange}
              handleDelete={handleDelete}
              isUpdating={isLoading}
            />
          ) : (
            <p>No food items found.</p>
          )}

          {currentItem && (
            <Suspense fallback={<div>Loading...</div>}>
              <FoodItemModal
                show={Boolean(currentItem)}
                handleClose={() => setCurrentItem(null)}
                handleSubmit={handleSubmit}
                initialData={currentItem}
              />
            </Suspense>
          )}
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default React.memo(FoodItemsPage);
