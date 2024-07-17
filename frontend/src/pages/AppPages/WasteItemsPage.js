import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import {
  wasteItemsState,
  foodItemsWithExpirationState,
  currentItemState,
} from "../../recoil/foodItemsAtoms";
import { useFoodItemManagement } from "../../hooks/useFoodItemManagement";
import Layout from "../../components/Layout/LayoutApp";
import WasteItemTable from "../../components/WasteItem/WasteItemTable";
import WasteItemModal from "../../components/WasteItem/WasteItemModal";
import { Button, Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { format } from "date-fns";

const WasteItemsPage = () => {
  const setWasteItems = useSetRecoilState(wasteItemsState);
  const foodItemsWithExpiration = useRecoilValue(foodItemsWithExpirationState);
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { error, setError, fetchItems, handleInputChange, handleDeleteItem } =
    useFoodItemManagement("waste");

  useEffect(() => {
    console.log("Fetching waste items...");
    setIsLoading(true);
    fetchItems().finally(() => setIsLoading(false));
  }, [fetchItems]);

  const handleSubmit = useCallback(
    async (newItem) => {
      try {
        setIsUpdating(true);
        const formData = new FormData();
        for (const key in newItem) {
          if (key === "image" && newItem[key] instanceof File) {
            formData.append(key, newItem[key], newItem[key].name);
          } else if (
            key === "dateRecorded" ||
            key === "expirationDate" ||
            key === "purchaseDate"
          ) {
            const formattedDate = format(new Date(newItem[key]), "yyyy-MM-dd");
            formData.append(key, formattedDate);
          } else {
            formData.append(key, newItem[key]);
          }
        }

        const response = await api.post("/waste/items", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.status === 201) {
          setWasteItems((prevItems) => [...prevItems, response.data]);
          setShowModal(false);
          setCurrentItem(null);
          fetchItems();
          toast.success("Waste item added successfully");
        } else {
          throw new Error("Failed to add the waste item.");
        }
      } catch (error) {
        console.error("Error adding waste item:", error);
        const errorMessage = error.response?.data?.message || error.message;
        setError("Failed to add the waste item: " + errorMessage);
        toast.error("Failed to add the waste item: " + errorMessage);
      } finally {
        setIsUpdating(false);
      }
    },
    [setWasteItems, setCurrentItem, fetchItems, setError]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        setIsUpdating(true);
        const result = await handleDeleteItem(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error("Error deleting waste item:", error);
        toast.error("Failed to delete the waste item");
      } finally {
        setIsUpdating(false);
      }
    },
    [handleDeleteItem]
  );

  const getCurrentDateFormatted = useCallback(() => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  }, []);

  const currentDate = useMemo(
    () => getCurrentDateFormatted(),
    [getCurrentDateFormatted]
  );

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="title">Waste Items</h1>
          <h2>{currentDate}</h2>
        </div>
        <div className="d-flex justify-content-end mb-1">
          <Button
            variant="danger"
            className="ml-auto"
            onClick={() => {
              setCurrentItem(null);
              setShowModal(true);
            }}
          >
            Add Waste Item
          </Button>
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
        ) : foodItemsWithExpiration.length > 0 ? (
          <WasteItemTable
            wasteItems={foodItemsWithExpiration}
            handleInputChange={handleInputChange}
            handleDelete={handleDelete}
            isUpdating={isUpdating}
          />
        ) : (
          <p>No waste items found.</p>
        )}

        {showModal && (
          <WasteItemModal
            show={showModal}
            handleClose={() => {
              setShowModal(false);
              setCurrentItem(null);
            }}
            handleSubmit={handleSubmit}
            setError={setError}
          />
        )}
      </div>
    </Layout>
  );
};

export default WasteItemsPage;
