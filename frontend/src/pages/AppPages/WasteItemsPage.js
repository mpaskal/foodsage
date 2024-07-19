import React, { useEffect, useMemo, useCallback, lazy } from "react";
import { useWasteItemManagement } from "../../hooks/useWasteItemManagement";
// import Layout from "../../components/Layout/LayoutApp";
import WasteItemTable from "../../components/WasteItem/WasteItemTable";
import { Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import ErrorBoundary from "../../components/Common/ErrorBoundary";

const Layout = lazy(() => import("../../components/Layout/LayoutApp"));

const ERROR_MESSAGES = {
  FAILED_TO_DELETE: "Failed to delete the waste item",
};

const WasteItemsPage = () => {
  const {
    wasteItems,
    error,
    isLoading,
    fetchItems,
    handleInputChange,
    handleDeleteItem,
  } = useWasteItemManagement();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        const result = await handleDeleteItem(id);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error("Error deleting waste item:", error);
        toast.error(ERROR_MESSAGES.FAILED_TO_DELETE);
      }
    },
    [handleDeleteItem]
  );

  const currentDate = useMemo(() => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date().toLocaleDateString("en-US", options);
  }, []);

  return (
    <ErrorBoundary>
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
            <WasteItemTable
              wasteItems={wasteItems}
              handleInputChange={handleInputChange}
              handleDelete={handleDelete}
              isUpdating={isLoading}
            />
          ) : (
            <p>No waste items found.</p>
          )}
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default React.memo(WasteItemsPage);
