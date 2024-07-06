import React, { useEffect } from "react";
import axios from "axios";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  wasteItemsState,
  wasteItemsWithExpirationState,
  currentItemState,
} from "../../recoil/wasteItemsAtoms";
import Layout from "../../components/Layout/LayoutApp";
import WasteItemTable from "../../components/WasteItem/WasteItemTable";
import WasteItemModal from "../../components/WasteItem/WasteItemModal";
import { Button, Alert, Spinner } from "react-bootstrap";
import { debounce } from "lodash";

const WasteItemsPage = () => {
  const [wasteItems, setWasteItems] = useRecoilState(wasteItemsState);
  const [wasteItemsWithExpiration, setWasteItemsWithExpiration] =
    useRecoilState(wasteItemsWithExpirationState);
  const setWasteItemsBase = useSetRecoilState(wasteItemsState);
  const [showModal, setShowModal] = React.useState(false);
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);

  useEffect(() => {
    const fetchWasteItems = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/wasteitems");
        console.log("Response received:", response.data); // Log the entire response for debugging

        if (response.data && Array.isArray(response.data.data)) {
          setWasteItemsBase(response.data.data);
        } else {
          console.error("Unexpected response structure:", response.data);
          setError("Unexpected response structure");
        }
      } catch (error) {
        console.error("Error fetching Waste items:", error);
        setError(
          "Failed to fetch waste items: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchWasteItems();
  }, [setWasteItemsBase]);

  const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  };

  const currentDate = getCurrentDateFormatted();

  const handleInputChange = debounce(async (itemId, field, value) => {
    if (!itemId) {
      console.error("Error updating item: Item ID is undefined");
      setError("An error occurred while updating the waste item.");
      return;
    }

    // Optimistic update
    setWasteItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, [field]: value } : item
      )
    );

    try {
      setIsUpdating(true);
      let updates = { [field]: value };

      const response = await axios.post(`/api/wasteitems/${itemId}`, updates);
      if (response.status !== 200) {
        // Revert the optimistic update if the server request fails
        setWasteItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, [field]: item[field] } : item
          )
        );
        setError("Failed to update the waste item.");
        console.error("Error updating item:", response.data);
      }
    } catch (error) {
      // Revert the optimistic update if the server request fails
      setWasteItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, [field]: item[field] } : item
        )
      );
      setError("An error occurred while updating the waste item.");
      console.error("Error updating item:", error);
    } finally {
      setIsUpdating(false);
    }
  }, 150);

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await axios.delete(`/api/wasteitems/${itemId}`);
      if (response.status === 200) {
        setWasteItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        setWasteItemsWithExpiration((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        console.log("Item deleted successfully");
      } else if (response.status === 404) {
        setError(`The waste item with ID ${itemId} was not found.`);
        console.error(`Error deleting item: Item with ID ${itemId} not found`);
      } else {
        setError("Failed to delete the waste item.");
        console.error("Error deleting item:", response.data);
      }
    } catch (error) {
      setError("An error occurred while deleting the waste item.");
      console.error("Error deleting item:", error);
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="title">Waste Inventory</h1>
          <h2>{currentDate}</h2>
        </div>
        <div className="d-flex justify-content-end mb-1">
          <Button
            variant="success"
            className="ml-auto"
            onClick={() => setShowModal(true)}
          >
            Add Waste Item
          </Button>
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
        ) : wasteItemsWithExpiration.length > 0 ? (
          <WasteItemTable
            wasteItems={wasteItemsWithExpiration}
            handleInputChange={handleInputChange}
            handleEdit={setShowModal}
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
            currentItem={currentItem}
          />
        )}
      </div>
    </Layout>
  );
};

export default WasteItemsPage;
