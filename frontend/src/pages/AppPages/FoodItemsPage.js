import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Layout from "../../components/Layout/LayoutApp";
import FoodItemTable from "../../components/FoodItem/FoodItemTable";
import FoodItemModal from "../../components/FoodItem/FoodItemModal";
import DeleteConfirmationModal from "../../components/FoodItem/DeleteConfirmationModal";
import { Button, Row, Col } from "react-bootstrap";
import { calculateExpirationDate } from "../../utils/dateUtils";
import { debounce } from "lodash";

const debouncedApiCall = debounce((id, data, callback) => {
  axios
    .patch(`/api/fooditems/${id}`, data)
    .then((response) => {
      console.log("Item updated successfully:", response.data);
      if (callback) callback(response.data);
    })
    .catch((error) => {
      console.error(
        "Error updating item:",
        error.response ? error.response.data : error.message
      );
    });
}, 500);

const FoodItemsPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Dairy",
    quantity: "",
    quantityMeasurement: "L",
    storage: "Fridge",
    cost: "",
    source: "",
    expirationDate: "",
    purchasedDate: new Date().toISOString().substring(0, 10), // Default to today
    image: null,
    tenantId: "",
    userId: "",
  });

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = useCallback(async () => {
    try {
      const response = await axios.get("/api/fooditems");
      setFoodItems(response.data);
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  }, []);

  const handleShowModal = (item) => {
    if (item) {
      setCurrentItem(item);
      setForm({
        ...item,
        expirationDate: item.expirationDate
          ? new Date(item.expirationDate).toISOString().substring(0, 10)
          : "",
        purchasedDate: item.purchasedDate
          ? new Date(item.purchasedDate).toISOString().substring(0, 10)
          : "",
        tenantId: item.tenantId || loggedInUser.tenantId,
        userId: item.userId || loggedInUser.id,
      });
      setIsEdit(true);
    } else {
      setCurrentItem(null);
      setForm({
        name: "",
        category: "Dairy",
        quantity: "",
        quantityMeasurement: "L",
        storage: "Fridge",
        cost: "",
        source: "",
        expirationDate: "",
        purchasedDate: new Date().toISOString().substring(0, 10), // Default to today
        image: null,
        tenantId: loggedInUser.tenantId,
        userId: loggedInUser.id,
      });
      setIsEdit(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = useCallback((id, name, value) => {
    if (!id || typeof id !== "string") {
      console.error("Invalid ID provided to handleInputChange:", id);
      return;
    }

    setFoodItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === id) {
          let updatedItem = { ...item, [name]: value };

          if (["category", "storage", "purchasedDate"].includes(name)) {
            const newExpirationDate = calculateExpirationDate(
              updatedItem.category,
              updatedItem.storage,
              updatedItem.purchasedDate
            );
            updatedItem.expirationDate = newExpirationDate;
            debouncedApiCall(id, {
              [name]: value,
              expirationDate: newExpirationDate,
            });
          } else {
            debouncedApiCall(id, { [name]: value });
          }

          return updatedItem;
        }
        return item;
      })
    );
  }, []);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prevForm) => ({
          ...prevForm,
          [name]: reader.result.split(",")[1], // Only save the base64 string
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (const key in form) {
        if (form[key] !== "") {
          formData.append(key, form[key]);
        }
      }

      if (isEdit) {
        const response = await axios.patch(
          `/api/fooditems/${currentItem._id}`,
          formData
        );
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === currentItem._id ? response.data : item
          )
        );
      } else {
        const response = await axios.post("/api/fooditems", formData);
        setFoodItems((prevItems) => [...prevItems, response.data]);
      }
      handleCloseModal();
    } catch (error) {
      console.error(
        "Error saving food item:",
        error.response ? error.response.data : error
      );
    }
  };

  const handleDelete = async (item) => {
    console.log("Deleting item:", item);
    if (!item || !item._id) {
      console.error("No valid item provided for deletion");
      return;
    }
    try {
      await axios.delete(`/api/fooditems/${item._id}`);
      fetchFoodItems();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting food item:", error);
    }
  };

  const handleShowDeleteModal = (item) => {
    setCurrentItem(item);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handleConsumeItem = (id, value) => {
    const updatedFoodItems = foodItems.map((item) =>
      item._id === id ? { ...item, consumed: value } : item
    );
    setFoodItems(updatedFoodItems);

    axios
      .patch(`/api/fooditems/${id}`, { consumed: value })
      .then((response) => {
        console.log("Consumed value updated successfully:", response.data);
        fetchFoodItems();
      })
      .catch((error) => {
        console.error("Error updating consumed value:", error);
      });
  };

  const handleMoveItem = (id, value) => {
    const updatedFoodItems = foodItems.map((item) =>
      item._id === id ? { ...item, move: value } : item
    );
    setFoodItems(updatedFoodItems);

    axios
      .patch(`/api/fooditems/${id}`, { move: value })
      .then((response) => {
        console.log("Move value updated successfully:", response.data);
        fetchFoodItems();
      })
      .catch((error) => {
        console.error("Error updating move value:", error);
      });
  };

  const getFormattedDate = (date) => {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(date);
  };

  const memoizedFoodItems = useMemo(() => foodItems, [foodItems]);

  return (
    <Layout>
      <div className="container">
        <Row className="align-items-center mb-3">
          <Col>
            <h1>Food Inventory</h1>
          </Col>
          <Col className="text-right">
            <h4>Today: {getFormattedDate(new Date())}</h4>
          </Col>
        </Row>
        <Button onClick={() => handleShowModal(null)}>Add Food Item</Button>
        <FoodItemTable
          foodItems={memoizedFoodItems}
          handleInputChange={handleInputChange}
          handleDelete={handleShowDeleteModal}
          handleMoveItem={handleMoveItem}
          handleConsumeItem={handleConsumeItem}
        />
        <FoodItemModal
          show={showModal}
          handleClose={handleCloseModal}
          handleSubmit={handleSubmit}
          handleChange={handleInputChange}
          handleFileChange={handleFileChange}
          form={form}
          isEdit={isEdit}
        />
        <DeleteConfirmationModal
          show={showDeleteModal}
          handleClose={handleCloseDeleteModal}
          confirmDelete={() => handleDelete(currentItem)}
        />
      </div>
    </Layout>
  );
};

export default FoodItemsPage;
