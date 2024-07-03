import React, { useState, useEffect, useCallback } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { foodItemsState, totalItemsState } from "../../recoil/atoms";
import Layout from "../../components/Layout/LayoutApp";
import {
  Button,
  Toast,
  ToastContainer,
  Spinner,
  Pagination,
} from "react-bootstrap";
import {
  useFetchFoodItems,
  useAddFoodItem,
  useUpdateFoodItem,
  useDeleteFoodItem,
} from "../../actions/foodItemActions";
import FoodItemTable from "../../components/FoodItem/FoodItemTable";
import FoodItemModal from "../../components/FoodItem/FoodItemModal";
import debounce from "lodash/debounce";
import { calculateExpirationDate } from "../../utils/dateUtils";

const FoodItemsPage = () => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);
  const totalItems = useRecoilValue(totalItemsState);
  const setTotalItems = useSetRecoilState(totalItemsState);
  const fetchFoodItems = useFetchFoodItems();
  const addFoodItem = useAddFoodItem();
  const updateFoodItem = useUpdateFoodItem();
  const deleteFoodItem = useDeleteFoodItem();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetchFoodItems(page, itemsPerPage);
      console.log("Fetch response FoodItemsPage:", response);
      if (response.success) {
        setFoodItems(response.items);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
      } else {
        throw new Error(response.error || "Error fetching food items");
      }
    } catch (error) {
      console.error("Error fetching food items", error);
      setToastMessage("Error fetching food items");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    storage: "",
    purchasedDate: "",
  });

  const debouncedApiCall = debounce(async (id, data) => {
    try {
      await updateFoodItem(id, data);
      console.log("Item updated successfully:", id, data);
    } catch (error) {
      console.error("Error updating item:", error);
      setToastMessage("Error updating item");
      setShowToast(true);
    }
  }, 500);

  const handleInputChange = useCallback(
    (id, name, value) => {
      if (name === "category" || name === "storage") {
        const expirationDate = calculateExpirationDate(
          newItem.category,
          newItem.storage,
          new Date(newItem.purchasedDate)
        );
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === id
              ? { ...item, [name]: value, expirationDate: expirationDate }
              : item
          )
        );
        debouncedApiCall(id, { [name]: value, expirationDate });
      } else {
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === id ? { ...item, [name]: value } : item
          )
        );
        debouncedApiCall(id, { [name]: value });
      }
    },
    [setFoodItems, newItem]
  );

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editItem) {
        await updateFoodItem(editItem._id, formData);
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === editItem._id ? { ...item, ...formData } : item
          )
        );
      } else {
        await addFoodItem(formData);
        setFoodItems((prevItems) => [...prevItems, formData]);
      }
      setToastMessage("Item saved successfully");
      setShowToast(true);
      handleCloseModal();
    } catch (error) {
      console.error("Error saving item:", error);
      setToastMessage("Error saving item");
      setShowToast(true);
    }
  };

  const handleDelete = useCallback(
    async (item) => {
      try {
        await deleteFoodItem(item._id);
        setFoodItems((prevItems) =>
          prevItems.filter((i) => i._id !== item._id)
        );
        setToastMessage("Item deleted successfully");
        setShowToast(true);
      } catch (error) {
        console.error("Error deleting item:", error);
        setToastMessage("Error deleting item");
        setShowToast(true);
      }
    },
    [deleteFoodItem, setFoodItems]
  );

  const handleMoveItem = useCallback(
    (id, newLocation) => {
      console.log(`Moving item ${id} to ${newLocation}`);
      setFoodItems((prevItems) =>
        prevItems.map((item) =>
          item._id === id ? { ...item, storage: newLocation } : item
        )
      );
      updateFoodItem(id, { storage: newLocation });
    },
    [setFoodItems, updateFoodItem]
  );

  const handleConsumeItem = useCallback(
    (id, consumedPercentage) => {
      console.log(`Marking item ${id} as ${consumedPercentage}% consumed`);
      setFoodItems((prevItems) =>
        prevItems.map((item) =>
          item._id === id ? { ...item, consumed: consumedPercentage } : item
        )
      );
      updateFoodItem(id, { consumed: consumedPercentage });
    },
    [setFoodItems, updateFoodItem]
  );

  return (
    <Layout>
      <div className="food-items">
        <h1>Food Items</h1>
        <div>Total Items: {totalItems}</div>
        <Button variant="primary" onClick={handleShowModal}>
          Add Item
        </Button>

        {isLoading ? (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <FoodItemTable
            foodItems={foodItems}
            handleInputChange={handleInputChange}
            handleDelete={handleDelete}
            handleMoveItem={handleMoveItem}
            handleConsumeItem={handleConsumeItem}
            handleEditItem={handleEditItem}
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

        <FoodItemModal
          show={showModal}
          handleClose={handleCloseModal}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          form={
            editItem || {
              name: "",
              category: "",
              storage: "",
              quantity: 0,
              quantityMeasurement: "",
              cost: 0,
              source: "",
              expirationDate: "",
              purchasedDate: "",
            }
          }
          isEdit={!!editItem}
        />
      </div>
    </Layout>
  );
};

export default FoodItemsPage;
