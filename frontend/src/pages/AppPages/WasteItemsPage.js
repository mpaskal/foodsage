// src/pages/WasteItems/WasteItemsPage.jsx

import React, { useEffect, useMemo } from "react";
import { useWasteItemManagement } from "../../hooks/useWasteItemManagement";
import Layout from "../../components/Layout/LayoutApp";
import WasteItemTable from "../../components/WasteItem/WasteItemTable";
import { Alert, Spinner, Pagination } from "react-bootstrap";
import { toast } from "react-toastify";

const WasteItemsPage = () => {
  const {
    wasteItems,
    error,
    isLoading,
    currentPage,
    totalPages,
    fetchItems,
    handleInputChange,
    handleDeleteItem,
    handlePageChange,
  } = useWasteItemManagement();

  useEffect(() => {
    console.log("Fetching waste items...");
    fetchItems();
  }, [fetchItems, currentPage]);

  const handleDelete = async (id) => {
    try {
      const result = await handleDeleteItem(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error deleting waste item:", error);
      toast.error("Failed to delete the waste item");
    }
  };

  const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  };

  const currentDate = useMemo(getCurrentDateFormatted, []);

  return (
    <Layout>
      <div className="container">
        <div className="d-flex justify-content-between my-3">
          <h1 className="title">Waste Items</h1>
          <h2>{currentDate}</h2>
        </div>

        {error && (
          <Alert variant="danger" dismissible>
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}
        {isLoading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : wasteItems.length > 0 ? (
          <>
            <WasteItemTable
              wasteItems={wasteItems}
              handleInputChange={handleInputChange}
              handleDelete={handleDelete}
              isUpdating={isLoading}
            />
            <Pagination className="mt-3">
              {[...Array(totalPages).keys()].map((number) => (
                <Pagination.Item
                  key={number + 1}
                  active={number + 1 === currentPage}
                  onClick={() => handlePageChange(number + 1)}
                >
                  {number + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </>
        ) : (
          <p>No waste items found.</p>
        )}
      </div>
    </Layout>
  );
};

export default WasteItemsPage;
