import React, { useEffect, useCallback, useState } from "react";
import api from "../../utils/api";
import { useRecoilState, useRecoilValue } from "recoil";
import { foodItemsState, currentItemState } from "../../recoil/foodItemsAtoms";
import Layout from "../../components/Layout/LayoutApp";
import WasteItemTable from "../../components/WasteItem/WasteItemTable";
import WasteItemModal from "../../components/WasteItem/WasteItemModal";
import { Button, Alert, Spinner } from "react-bootstrap";

const WasteItemsPage = () => {
  const [wasteItems, setWasteItems] = useRecoilState(foodItemsState);
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchWasteItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/wasteItems"); // Use custom Axios instance
      if (response.data && Array.isArray(response.data.data)) {
        setWasteItems(response.data.data);
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
  }, [setWasteItems]);

  useEffect(() => {
    fetchWasteItems();
  }, [fetchWasteItems]);

  const handleMoveItem = async (itemId, newMoveTo) => {
    try {
      setIsUpdating(true);
      const response = await api.post(`/wasteItems/${itemId}/move`, {
        moveTo: newMoveTo,
      }); // Use custom Axios instance
      if (response.status !== 200) {
        setError("Failed to move the waste item.");
        console.error("Error moving item:", response.data);
      } else {
        setWasteItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, moveTo: newMoveTo } : item
          )
        );
      }
    } catch (error) {
      setError("An error occurred while moving the waste item.");
      console.error("Error moving item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="title">Waste Items</h1>
        </div>
        {error && (
          <Alert variant="danger">
            <strong>Error:</strong> {error}
          </Alert>
        )}
        {isLoading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : wasteItems.length > 0 ? (
          <WasteItemTable
            wasteItems={wasteItems}
            handleMove={handleMoveItem}
            isUpdating={isUpdating}
          />
        ) : (
          <p>No waste items found.</p>
        )}

        {showModal && (
          <WasteItemModal
            show={showModal}
            handleClose={() => setShowModal(false)}
            handleMove={handleMoveItem}
          />
        )}
      </div>
    </Layout>
  );
};

export default WasteItemsPage;
