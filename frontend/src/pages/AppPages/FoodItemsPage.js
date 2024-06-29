import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout/LayoutApp";
import FoodItemTable from "../../components/FoodItem/FoodItemTable";
import FoodItemModal from "../../components/FoodItem/FoodItemModal";
import DeleteConfirmationModal from "../../components/FoodItem/DeleteConfirmationModal";
import { Button } from "react-bootstrap";

const FoodItemsPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Meat", // Default category
    quantity: "",
    quantityMeasurement: "Kg", // Default quantity measurement
    storage: "Fridge", // Default storage
    cost: "",
    source: "",
    expirationDate: "",
    purchasedDate: new Date().toLocaleDateString("en-CA"), // Default to today in local time
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
        category: "Meat", // Default category
        quantity: "",
        quantityMeasurement: "Kg", // Default quantity measurement
        storage: "Fridge", // Default storage
        cost: "",
        source: "",
        expirationDate: "",
        purchasedDate: new Date().toLocaleDateString("en-CA"), // Default to today in local time
        image: null,
        tenantId: loggedInUser.tenantId,
        userId: loggedInUser.id,
      });
      setIsEdit(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, [name]: reader.result.split(",")[1] }); // Only save the base64 string
      };
      reader.readAsDataURL(file);
    } else {
      setForm({ ...form, [name]: "" });
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
      console.log(
        "Form Data being sent:",
        Object.fromEntries(formData.entries())
      ); // Log form data for debugging

      if (isEdit) {
        console.log("Editing item with ID:", currentItem._id);
        await axios.patch(`/api/fooditems/${currentItem._id}`, formData);
      } else {
        console.log("Adding new item");
        await axios.post("/api/fooditems", formData);
      }
      fetchFoodItems();
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

  return (
    <Layout>
      <div className="container">
        <h1>Food Inventory</h1>
        <Button onClick={() => handleShowModal(null)}>Add Food Item</Button>
        <FoodItemTable
          foodItems={foodItems}
          handleShowModal={handleShowModal}
          handleDelete={handleShowDeleteModal}
          loggedInUser={loggedInUser}
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
