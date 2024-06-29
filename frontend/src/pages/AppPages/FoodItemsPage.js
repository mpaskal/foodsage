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
    category: "",
    quantity: "",
    quantityMeasurement: "item",
    storage: "",
    cost: "",
    source: "",
    expirationDate: "",
    purchasedDate: "",
    image: null,
    tenantId: "",
    userId: "",
  });

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  console.log("LoggedInUser:", loggedInUser); // Log loggedInUser

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
        tenantId: loggedInUser?.tenantId || "",
        userId: loggedInUser?.id || "",
      });
      setIsEdit(true);
    } else {
      setCurrentItem(null);
      setForm({
        name: "",
        category: "",
        quantity: "",
        quantityMeasurement: "item",
        storage: "",
        cost: "",
        source: "",
        expirationDate: "",
        purchasedDate: "",
        image: null,
        tenantId: loggedInUser?.tenantId || "",
        userId: loggedInUser?.id || "",
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
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("quantity", form.quantity);
    formData.append("quantityMeasurement", form.quantityMeasurement);
    formData.append("storage", form.storage);
    formData.append("cost", form.cost);
    formData.append("source", form.source);
    formData.append("expirationDate", form.expirationDate);
    formData.append("purchasedDate", form.purchasedDate);
    formData.append("tenantId", form.tenantId);
    formData.append("userId", form.userId);
    if (form.image) {
      formData.append("image", form.image);
    }

    console.log("Form Data:", [...formData.entries()]); // Add logging here

    try {
      if (isEdit) {
        await axios.patch(`/api/fooditems/${currentItem.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post("/api/fooditems", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      fetchFoodItems();
      handleCloseModal();
    } catch (error) {
      console.error(
        "Error saving food item:",
        error.response?.data || error.message
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/fooditems/${id}`);
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
          confirmDelete={() => handleDelete(currentItem.id)}
        />
      </div>
    </Layout>
  );
};

export default FoodItemsPage;
