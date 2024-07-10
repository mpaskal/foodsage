import React, { useEffect, useCallback, useState } from "react";
import api from "../../utils/api";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  foodItemsState,
  currentItemState,
  wasteItemsState,
} from "../../recoil/foodItemsAtoms";
import Layout from "../../components/Layout/LayoutApp";
import WasteItemTable from "../../components/WasteItem/WasteItemTable";
import WasteItemModal from "../../components/WasteItem/WasteItemModal";
import { Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  calculateExpirationDate,
  formatDateForDisplay,
} from "../../utils/dateUtils";

const WasteItemsPage = () => {
  const wasteItems = useRecoilValue(wasteItemsState);
  const setFoodItems = useSetRecoilState(foodItemsState);
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  const fetchWasteItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/wasteItems");
      if (response.data && Array.isArray(response.data.data)) {
        setFoodItems((prevItems) => {
          const updatedItems = prevItems.map((item) => {
            if (item.moveTo === "Waste") {
              return {
                ...item,
                ...response.data.data.find(
                  (wasteItem) => wasteItem._id === item._id
                ),
              };
            }
            return item;
          });
          return updatedItems;
        });
      } else {
        console.error("Unexpected response structure:", response.data);
        setError("Unexpected response structure");
      }
    } catch (error) {
      console.error("Error fetching waste items:", error);
      setError(
        "Failed to fetch waste items: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  }, [setFoodItems]);

  useEffect(() => {
    fetchWasteItems();
  }, [fetchWasteItems]);

  const handleInputChange = async (itemId, field, value) => {
    setIsUpdating(true);
    try {
      if (field === "moveTo" && value === "Consume") {
        const item = wasteItems.find((item) => item._id === itemId);
        if (!item) throw new Error("Item not found");

        const newExpirationDate = calculateExpirationDate(
          item.category,
          item.storage,
          new Date().toISOString()
        );

        const response = await api.post(`/wasteItems/${itemId}/move`, {
          moveTo: "Consume",
          expirationDate: newExpirationDate,
        });

        if (response.status === 200) {
          setFoodItems((prevItems) =>
            prevItems.map((item) =>
              item._id === itemId
                ? {
                    ...item,
                    moveTo: "Consume",
                    expirationDate: formatDateForDisplay(newExpirationDate),
                  }
                : item
            )
          );
          toast.success("Item moved back to Food Items");
        } else {
          throw new Error("Failed to move the item");
        }
      } else {
        const response = await api.post(`/wasteItems/${itemId}`, {
          [field]: value,
        });
        if (response.status === 200) {
          setFoodItems((prevItems) =>
            prevItems.map((item) =>
              item._id === itemId ? { ...item, [field]: value } : item
            )
          );
        } else {
          throw new Error("Failed to update the item");
        }
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
      const response = await api.delete(`/wasteItems/${itemId}`);
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

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="title">Waste Items</h1>
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
        ) : wasteItems.length > 0 ? (
          <WasteItemTable
            wasteItems={wasteItems}
            handleInputChange={handleInputChange}
            handleDelete={handleDeleteItem}
            isUpdating={isUpdating}
          />
        ) : (
          <p>No waste items found.</p>
        )}

        {showModal && (
          <WasteItemModal
            show={showModal}
            handleClose={() => setShowModal(false)}
            handleSubmit={handleInputChange}
          />
        )}
      </div>
    </Layout>
  );
};

export default WasteItemsPage;
