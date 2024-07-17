import React, { useEffect, useCallback, useState } from "react";
import api from "../../utils/api";
import { moveItem } from "../../utils/itemMovementUtils";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  foodItemsState,
  currentItemState,
  donationItemsState,
} from "../../recoil/foodItemsAtoms";
import Layout from "../../components/Layout/LayoutApp";
import DonationItemTable from "../../components/DonationItem/DonationItemTable";
import { useFoodItemManagement } from "../../hooks/useFoodItemManagement";
import { Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DonationItemsPage = () => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);
  const donationItems = useRecoilValue(donationItemsState);
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  const fetchDonationItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/foodItems/donate");
      if (response.data && Array.isArray(response.data.data)) {
        const currentDate = new Date();
        const thirtyDaysAgo = new Date(
          currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
        );

        const filteredItems = response.data.data.filter((item) => {
          const donationDate = new Date(item.donationDate);
          return donationDate > thirtyDaysAgo;
        });

        setFoodItems(filteredItems);
      }
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  }, [setFoodItems]);

  useEffect(() => {
    fetchDonationItems();
  }, [fetchDonationItems]);

  const handleInputChange = async (itemId, field, value) => {
    setIsUpdating(true);
    try {
      const response = await api.post(`/donationItems/${itemId}`, {
        [field]: value,
      });
      if (response.status === 200) {
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, [field]: value } : item
          )
        );
        toast.success("Item updated successfully");
      } else {
        throw new Error("Failed to update the item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      setError("An error occurred while updating the item: " + error.message);
      toast.error("Failed to update the item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await api.delete(`/donationItems/${itemId}`);
      if (response.status === 200) {
        setFoodItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        toast.success("Item deleted successfully");
      } else {
        throw new Error("Failed to delete the item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("An error occurred while deleting the item: " + error.message);
      toast.error("Failed to delete the item");
    }
  };

  const handleMoveItem = async (itemId, newstatus) => {
    try {
      setIsUpdating(true);
      const response = await api.post(`/donationItems/${itemId}/move`, {
        status: newstatus,
      });
      if (response.status === 200) {
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, status: newstatus } : item
          )
        );
        toast.success(`Item moved to ${newstatus} successfully`);
      } else {
        throw new Error("Failed to move the item");
      }
    } catch (error) {
      console.error("Error moving item:", error);
      setError("An error occurred while moving the item: " + error.message);
      toast.error("Failed to move the item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlestatusConsume = async (itemId) => {
    try {
      const response = await api.post(`/foodItems/${itemId}`, {
        status: "Consume",
        donationDate: null,
      });
      if (response.status === 200) {
        // Remove the item from the donation items list
        setFoodItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
      }
    } catch (error) {
      // Error handling
    }
  };

  const handlestatusWaste = async (itemId) => {
    try {
      const response = await api.post(`/foodItems/${itemId}`, {
        status: "Waste",
        donationDate: null,
        wasteDate: new Date().toISOString(),
      });
      if (response.status === 200) {
        // Remove the item from the donation items list
        setFoodItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
      }
    } catch (error) {
      // Error handling
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="title">Donation Items</h1>
        </div>
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}
        {isLoading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : donationItems.length > 0 ? (
          <DonationItemTable
            donationItems={donationItems}
            handleInputChange={handleInputChange}
            handleDelete={handleDeleteItem}
            handleMove={handleMoveItem}
            isUpdating={isUpdating}
          />
        ) : (
          <p>No donation items found.</p>
        )}
      </div>
    </Layout>
  );
};

export default DonationItemsPage;
