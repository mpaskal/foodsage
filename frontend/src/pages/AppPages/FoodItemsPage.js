import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout/LayoutApp";
import FoodItemTable from "../../components/FoodItem/FoodItemTable";
import DeleteConfirmationModal from "../../components/FoodItem/DeleteConfirmationModal";
import { Button, Row, Col } from "react-bootstrap";
import { calculateExpirationDate } from "../../utils/dateUtils";

const FoodItemsPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
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

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get("/api/fooditems");
      setFoodItems(response.data);
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };

  const handleInputChange = async (id, name, value) => {
    try {
      const updatedItem = { ...foodItems.find((item) => item._id === id) };
      updatedItem[name] = value;

      if (
        name === "category" ||
        name === "storage" ||
        name === "purchasedDate"
      ) {
        updatedItem.expirationDate = calculateExpirationDate(
          updatedItem.category,
          updatedItem.storage,
          updatedItem.purchasedDate
        )
          .toISOString()
          .substring(0, 10);
      }

      await axios.patch(`/api/fooditems/${id}`, { [name]: value });
      setFoodItems((prevItems) =>
        prevItems.map((item) => (item._id === id ? updatedItem : item))
      );
    } catch (error) {
      console.error("Error updating food item:", error);
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
    }
    setShowModal(true);
  };

  const getFormattedDate = (date) => {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(date);
  };

  const handleConsumeItem = async (id, consumed) => {
    try {
      const updatedItem = { ...foodItems.find((item) => item._id === id) };
      updatedItem.consumed = consumed;

      if (consumed === "100") {
        await axios.patch(`/api/fooditems/${id}`, { consumed });
        setFoodItems((prevItems) =>
          prevItems.filter((item) => item._id !== id)
        );
      } else {
        await axios.patch(`/api/fooditems/${id}`, { consumed });
        setFoodItems((prevItems) =>
          prevItems.map((item) => (item._id === id ? updatedItem : item))
        );
      }
    } catch (error) {
      console.error("Error updating consumed value:", error);
    }
  };

  const handleMoveItem = async (id, move) => {
    try {
      const updatedItem = { ...foodItems.find((item) => item._id === id) };
      updatedItem.move = move;

      await axios.patch(`/api/fooditems/${id}`, { move });

      setFoodItems((prevItems) =>
        prevItems.map((item) => (item._id === id ? updatedItem : item))
      );

      if (move === "consumed" || move === "donate" || move === "waste") {
        setFoodItems((prevItems) =>
          prevItems.filter((item) => item._id !== id)
        );
      }
    } catch (error) {
      console.error("Error updating move value:", error);
    }
  };

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
          foodItems={foodItems}
          handleInputChange={handleInputChange}
          handleDelete={handleShowDeleteModal}
          handleConsumeItem={handleConsumeItem}
          handleMoveItem={handleMoveItem}
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
