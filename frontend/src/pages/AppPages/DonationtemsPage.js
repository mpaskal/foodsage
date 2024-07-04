import React, { useEffect } from "react";
import axios from "axios";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  donationItemsState,
  donationItemsWithExpirationState,
  currentItemState,
} from "../../recoil/donationItemsAtoms";
import Layout from "../../components/Layout/LayoutApp";
import DonationItemTable from "../../components/DonationItem/DonationItemTable";
import DonationItemModal from "../../components/DonationItem/DonationItemModal";
import { Button, Alert, Spinner } from "react-bootstrap";
import { debounce } from "lodash";

const DonationItemsPage = () => {
  const [donationItems, setDonationItems] = useRecoilState(donationItemsState);
  const [donationItemsWithExpiration, setDonationItemsWithExpiration] =
    useRecoilState(donationItemsWithExpirationState);
  const setDonationItemsBase = useSetRecoilState(donationItemsState);
  const [showModal, setShowModal] = React.useState(false);
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);

  useEffect(() => {
    const fetchDonationItems = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/donationitems");
        console.log("Response received:", response.data); // Log the entire response for debugging

        if (response.data && Array.isArray(response.data.data)) {
          setDonationItemsBase(response.data.data);
        } else {
          console.error("Unexpected response structure:", response.data);
          setError("Unexpected response structure");
        }
      } catch (error) {
        console.error("Error fetching donation items:", error);
        setError(
          "Failed to fetch donation items: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonationItems();
  }, [setDonationItemsBase]);

  const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  };

  const currentDate = getCurrentDateFormatted();

  const handleInputChange = debounce(async (itemId, field, value) => {
    if (!itemId) {
      console.error("Error updating item: Item ID is undefined");
      setError("An error occurred while updating the donation item.");
      return;
    }

    // Optimistic update
    setDonationItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, [field]: value } : item
      )
    );

    try {
      setIsUpdating(true);
      let updates = { [field]: value };

      const response = await axios.patch(
        `/api/donationitems/${itemId}`,
        updates
      );
      if (response.status !== 200) {
        // Revert the optimistic update if the server request fails
        setDonationItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, [field]: item[field] } : item
          )
        );
        setError("Failed to update the donation item.");
        console.error("Error updating item:", response.data);
      }
    } catch (error) {
      // Revert the optimistic update if the server request fails
      setDonationItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, [field]: item[field] } : item
        )
      );
      setError("An error occurred while updating the donation item.");
      console.error("Error updating item:", error);
    } finally {
      setIsUpdating(false);
    }
  }, 150);

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await axios.delete(`/api/donationitems/${itemId}`);
      if (response.status === 200) {
        setDonationItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        setDonationItemsWithExpiration((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        console.log("Item deleted successfully");
      } else if (response.status === 404) {
        setError(`The donation item with ID ${itemId} was not found.`);
        console.error(`Error deleting item: Item with ID ${itemId} not found`);
      } else {
        setError("Failed to delete the donation item.");
        console.error("Error deleting item:", response.data);
      }
    } catch (error) {
      setError("An error occurred while deleting the donation item.");
      console.error("Error deleting item:", error);
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="title">Donation Inventory</h1>
          <h2>{currentDate}</h2>
        </div>
        <div className="d-flex justify-content-end mb-1">
          <Button
            variant="success"
            className="ml-auto"
            onClick={() => setShowModal(true)}
          >
            Add Donation Item
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
        ) : donationItemsWithExpiration.length > 0 ? (
          <DonationItemTable
            donationItems={donationItemsWithExpiration}
            handleInputChange={handleInputChange}
            handleEdit={setShowModal}
            handleDelete={handleDeleteItem}
            isUpdating={isUpdating}
          />
        ) : (
          <p>No donation items found.</p>
        )}

        {showModal && (
          <DonationItemModal
            show={showModal}
            handleClose={() => setShowModal(false)}
            currentItem={currentItem}
          />
        )}
      </div>
    </Layout>
  );
};

export default DonationItemsPage;
