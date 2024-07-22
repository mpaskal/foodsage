import React, { useEffect, useMemo, useCallback, lazy } from "react";
import { useRecoilValue } from "recoil";
import { donationItemsSelector } from "../../recoil/foodItemsAtoms";
import { useDonationItemManagement } from "../../hooks/useDonationItemManagement";
import DonationItemTable from "../../components/DonationItem/DonationItemTable";
import { Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import ErrorBoundary from "../../components/Common/ErrorBoundary";
import { getCurrentDateFormatted } from "../../utils/dateUtils";

const Layout = lazy(() => import("../../components/Layout/LayoutApp"));
const ERROR_MESSAGES = {
  FAILED_TO_DELETE: "Failed to delete the donation item",
};

const DonationItemsPage = () => {
  const currentDate = getCurrentDateFormatted();
  const donationItems = useRecoilValue(donationItemsSelector);
  const { error, isLoading, fetchItems, handleInputChange, handleDeleteItem } =
    useDonationItemManagement();

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
        console.error("Error deleting item:", error);
        toast.error(ERROR_MESSAGES.FAILED_TO_DELETE);
      }
    },
    [handleDeleteItem]
  );

  return (
    <ErrorBoundary>
      <Layout>
        <div className="container">
          <div className="d-flex justify-content-between my-3">
            <h1 className="title">Donation Inventory</h1>
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
          ) : donationItems.length > 0 ? (
            <DonationItemTable
              donationItems={donationItems}
              handleInputChange={handleInputChange}
              handleDelete={handleDelete}
              isUpdating={isLoading}
            />
          ) : (
            <p>No donation items found.</p>
          )}
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default React.memo(DonationItemsPage);
