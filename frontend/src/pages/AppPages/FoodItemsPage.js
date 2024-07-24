import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  allFoodItemsState,
  activeFoodItemsSelector,
} from "../../recoil/foodItemsAtoms";
import { loggedInUserState, authTokenState } from "../../recoil/userAtoms";
import { useFoodItemManagement } from "../../hooks/useFoodItemManagement";
import Layout from "../../components/Layout/LayoutApp";
import FoodItemTable from "../../components/FoodItem/FoodItemTable";
import { Button, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import ErrorBoundary from "../../components/Common/ErrorBoundary";
import {
  formatDateForDisplay,
  getCurrentDateFormatted,
} from "../../utils/dateUtils";
import api from "../../utils/api";

const FoodItemModal = React.lazy(() =>
  import("../../components/FoodItem/FoodItemModal")
);

const ERROR_MESSAGES = {
  FAILED_TO_ADD: "Failed to add the food item",
  FAILED_TO_DELETE: "Failed to delete the food item",
};

const FoodItemsPage = () => {
  const currentDate = getCurrentDateFormatted();
  const [allFoodItems, setAllFoodItems] = useRecoilState(allFoodItemsState);
  const activeFoodItems = useRecoilValue(activeFoodItemsSelector);
  const loggedInUser = useRecoilValue(loggedInUserState);
  const authToken = useRecoilValue(authTokenState);
  const [currentItem, setCurrentItem] = useState(null);
  const { error, isLoading, fetchItems, handleInputChange, handleDeleteItem } =
    useFoodItemManagement("food");

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = useCallback(
    async (newItem) => {
      try {
        console.log("Received item in FoodItemsPage:", newItem);

        const formData = new FormData();
        for (const key in newItem) {
          if (key === "image" && newItem[key] instanceof File) {
            formData.append(key, newItem[key], newItem[key].name);
          } else {
            formData.append(key, newItem[key]);
          }
        }

        formData.append("updatedBy", loggedInUser.id);

        console.log("FormData entries:");
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        const response = await api.post("/food/items", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        });

        console.log("Server response:", response.data);

        if (response.status === 201) {
          console.log("New item added:", response.data);
          setAllFoodItems((prevItems) => [...prevItems, response.data.data]);
          setCurrentItem(null);
          toast.success("Food item added successfully");
        } else {
          throw new Error("Failed to add the food item.");
        }
      } catch (error) {
        console.error("Error adding item in FoodItemsPage:", error);
        let errorMessage;
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else {
          errorMessage = "An unknown error occurred";
        }
        toast.error(`${ERROR_MESSAGES.FAILED_TO_ADD}: ${errorMessage}`);
        console.log("Full error object:", error);
        if (error.response) {
          console.log("Error response:", error.response);
        }
      }
    },
    [setAllFoodItems, authToken, loggedInUser]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        const result = await handleDeleteItem(id);
        if (result && result.success) {
          setAllFoodItems((prevItems) =>
            prevItems.filter((item) => item._id !== id)
          );
          toast.success(result.message);
        } else {
          toast.error(
            result && result.error
              ? result.error
              : ERROR_MESSAGES.FAILED_TO_DELETE
          );
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error(
          typeof error === "string" ? error : ERROR_MESSAGES.FAILED_TO_DELETE
        );
      }
    },
    [handleDeleteItem, setAllFoodItems]
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
              <p>
                {typeof error === "object"
                  ? JSON.stringify(error)
                  : error.toString()}
              </p>
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
