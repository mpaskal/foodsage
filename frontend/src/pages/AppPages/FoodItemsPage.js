import React, { useEffect, useState, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import axios from "axios";
import Layout from "../../components/Layout/LayoutApp";
import {
  Button,
  Toast,
  ToastContainer,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { foodItemsState } from "../../recoil/atoms";
import {
  useFetchFoodItems,
  useAddFoodItem,
  useUpdateFoodItem,
} from "../../actions/foodItemActions";
import debounce from "lodash/debounce"; // Import debounce from lodash
import FoodItemsTable from "../../components/FoodItem/FoodItemTable"; // Import the FoodItemsTable component

const FoodItemsPage = () => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);
  const fetchFoodItems = useFetchFoodItems();
  const addFoodItem = useAddFoodItem();
  const updateFoodItem = useUpdateFoodItem();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // define itemsPerPage

  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetchFoodItems(page, itemsPerPage);
      if (response.success) {
        setTotalPages(response.totalPages);
      } else {
        throw new Error("Error fetching food items");
      }
    } catch (error) {
      console.error("Error fetching food items", error);
      setToastMessage("Error fetching food items");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowModal = () => {
    // Logic to show modal for adding a new item
  };

  const handleDelete = (id) => {
    // Logic to delete a food item
  };

  const handleInputChange = useCallback((id, name, value) => {
    if (!id || typeof id !== "string") {
      console.error("Invalid ID provided to handleInputChange:", id);
      return;
    }

    setFoodItems((prevItems) =>
      prevItems.map((item) =>
        item._id === id ? { ...item, [name]: value } : item
      )
    );

    debouncedApiCall(id, { [name]: value });
  }, []);

  const debouncedApiCall = debounce(async (id, data) => {
    try {
      const response = await axios.patch(`/api/fooditems/${id}`, data);
      console.log("Item updated successfully:", response.data);
    } catch (error) {
      console.error(
        "Error updating item:",
        error.response ? error.response.data : error.message
      );
    }
  }, 500);

  return (
    <Layout>
      <div className="food-items">
        <h1>Food Items</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Add Item
        </Button>

        {isLoading ? (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <FoodItemsTable
            items={foodItems}
            handleInputChange={handleInputChange}
            handleDelete={handleDelete}
          />
        )}
        <Pagination className="mt-3">
          {[...Array(totalPages).keys()].map((number) => (
            <Pagination.Item
              key={number + 1}
              active={number + 1 === page}
              onClick={() => setPage(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          ))}
        </Pagination>
        <ToastContainer position="top-end" className="p-3">
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
          >
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </Layout>
  );
};

export default FoodItemsPage;
