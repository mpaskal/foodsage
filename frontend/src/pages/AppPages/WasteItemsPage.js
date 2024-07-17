import React, { useEffect, useCallback, useState } from "react";
import api from "../../utils/api";
import { moveItem } from "../../utils/itemMovementUtils";
import { useRecoilState } from "recoil";
import { foodItemsState } from "../../recoil/foodItemsAtoms";
import Layout from "../../components/Layout/LayoutApp";
import WasteItemTable from "../../components/WasteItem/WasteItemTable";
import { Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const WasteItemsPage = () => {
  const [wasteItems, setWasteItems] = useRecoilState(foodItemsState);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchWasteItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/foodItems/waste");
      if (response.data && Array.isArray(response.data.data)) {
        setWasteItems(response.data.data);
      }
    } catch (error) {
      setError("Failed to fetch waste items. Please try again.");
      toast.error("Failed to fetch waste items");
    } finally {
      setIsLoading(false);
    }
  }, [setWasteItems]);

  useEffect(() => {
    fetchWasteItems();
  }, [fetchWasteItems]);

  const handlestatusConsume = async (itemId) => {
    setIsUpdating(true);
    try {
      const response = await api.post(`/foodItems/statusConsume/${itemId}`);
      if (response.status === 200) {
        setWasteItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        toast.success("Item moved to Consume successfully");
      }
    } catch (error) {
      console.error("Error moving item to Consume:", error);
      setError("An error occurred while moving the item to Consume.");
      toast.error("Failed to move item to Consume");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    setIsUpdating(true);
    try {
      const response = await api.post(`/foodItems/delete`, { _id: itemId });
      if (response.status === 204) {
        setWasteItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        toast.success("Item deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("An error occurred while deleting the item.");
      toast.error("Failed to delete the item");
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
            handlestatusConsume={handlestatusConsume}
            handleDelete={handleDeleteItem}
            isUpdating={isUpdating}
          />
        ) : (
          <p>No waste items found.</p>
        )}
      </div>
    </Layout>
  );
};

export default WasteItemsPage;
