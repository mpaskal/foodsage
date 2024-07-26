import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Table, Button, FormControl, Pagination } from "react-bootstrap";
import { useRecoilValue } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import InlineEditControl from "../Common/InlineEditControl";
import DeleteFoodConfirmationModal from "./DeleteFoodConfirmationModal";
import {
  quantityMeasurementsByCategory,
  statusOptions,
  categories,
  storages,
} from "../../utils/constants";
import {
  formatDateForDisplay,
  calculateExpirationDate,
  getDaysSinceExpiration,
  getCurrentDate,
} from "../../utils/dateUtils";

const GenericItemTable = React.memo(
  ({
    items,
    handleInputChange,
    handleDelete,
    isUpdating,
    tableColumns,
    itemType,
  }) => {
    console.log("Items received in GenericItemTable:", items);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const loggedInUser = useRecoilValue(loggedInUserState);
    const [editingItems, setEditingItems] = useState({});

    const [sortConfig, setSortConfig] = useState({
      key: "expirationDate",
      direction: "ascending",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const memoizedItems = useMemo(() => items, [items]);

    useEffect(() => {
      const updatedEditingItems = { ...editingItems };
      let hasChanges = false;

      items.forEach((item) => {
        if (
          editingItems[item._id] &&
          editingItems[item._id].category !== item.category
        ) {
          updatedEditingItems[item._id] = {
            ...editingItems[item._id],
            category: item.category,
          };
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setEditingItems(updatedEditingItems);
      }
    }, [items, editingItems]);

    const filteredItems = useMemo(() => {
      return memoizedItems.filter((item) =>
        Object.values(item).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }, [memoizedItems, searchQuery]);

    const sortedItems = useMemo(() => {
      let sortableItems = [...filteredItems];
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
      return sortableItems;
    }, [filteredItems, sortConfig]);

    const paginatedItems = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return sortedItems.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedItems, currentPage]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const requestSort = (key) => {
      let direction = "ascending";
      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
      if (sortConfig.key === key) {
        return sortConfig.direction === "ascending" ? "▲" : "▼";
      }
      return null;
    };

    const handleLocalInputChange = useCallback(
      (id, field, value) => {
        setEditingItems((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            [field]: value,
          },
        }));

        let updates = { [field]: value };

        const itemToUpdate = memoizedItems.find((item) => item._id === id);
        if (!itemToUpdate) return;

        if (
          field === "category" ||
          field === "storage" ||
          field === "purchasedDate"
        ) {
          updates.expirationDate = calculateExpirationDate(
            field === "category" ? value : itemToUpdate.category,
            field === "storage" ? value : itemToUpdate.storage,
            field === "purchasedDate" ? value : itemToUpdate.purchasedDate
          );
        }

        if (field === "consumed") {
          updates[field] = parseInt(value, 10);
          if (updates[field] === 100) {
            updates.status = "Consumed";
          }
        }

        if (field === "status") {
          if (value === "Consumed") {
            updates.consumed = 100;
          } else if (value === "Waste" || value === "Donation") {
            updates.statusChangeDate = getCurrentDate();
          }
        }

        handleInputChange(id, updates);
      },
      [memoizedItems, handleInputChange]
    );

    const confirmDelete = useCallback(async () => {
      if (itemToDelete) {
        await handleDelete(itemToDelete._id);
        setShowDeleteModal(false);
        setItemToDelete(null);
      }
    }, [handleDelete, itemToDelete]);

    const handleDeleteClick = useCallback((item) => {
      setItemToDelete(item);
      setShowDeleteModal(true);
    }, []);

    const getImageSrc = useCallback((image) => {
      if (image && typeof image === "string" && image.length > 0) {
        return `data:image/jpeg;base64,${image}`;
      }
      return `No image`;
    }, []);

    const getExpirationDateStyle = useCallback((expirationDate) => {
      const daysSinceExpiration = getDaysSinceExpiration(expirationDate);
      if (daysSinceExpiration > 0) {
        return { backgroundColor: "red", color: "white" };
      } else if (daysSinceExpiration >= -1) {
        return { backgroundColor: "yellow", color: "black" };
      } else {
        return { backgroundColor: "green", color: "white" };
      }
    }, []);

    const handleFileChange = useCallback(
      async (id, file) => {
        try {
          const formData = new FormData();
          formData.append("image", file, file.name);
          handleInputChange(id, formData);
        } catch (error) {
          console.error("Error processing image:", error);
        }
      },
      [handleInputChange]
    );

    return (
      <>
        <FormControl
          type="text"
          placeholder="Search"
          className="mb-3"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Table striped bordered hover>
          <thead>
            <tr>
              {tableColumns.map((column) => (
                <th key={column.key} onClick={() => requestSort(column.key)}>
                  {column.label} {getSortIndicator(column.key)}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item._id}>
                {tableColumns.map((column) => (
                  <td
                    key={column.key}
                    style={
                      column.key === "expirationDate"
                        ? getExpirationDateStyle(item[column.key])
                        : {}
                    }
                  >
                    <InlineEditControl
                      type={column.type}
                      options={
                        column.key === "quantityMeasurement"
                          ? quantityMeasurementsByCategory[item.category] || []
                          : column.key === "status"
                          ? statusOptions
                          : column.key === "category"
                          ? categories
                          : column.key === "storage"
                          ? storages
                          : column.options
                      }
                      value={
                        editingItems[item._id] &&
                        editingItems[item._id][column.key] !== undefined
                          ? editingItems[item._id][column.key]
                          : column.type === "date"
                          ? formatDateForDisplay(item[column.key])
                          : column.key === "consumed"
                          ? item[column.key].toString()
                          : item[column.key]
                          ? item[column.key].toString()
                          : ""
                      }
                      onChange={(value) =>
                        column.type === "file"
                          ? handleFileChange(item._id, value)
                          : handleLocalInputChange(item._id, column.key, value)
                      }
                      getImageSrc={
                        column.type === "file" ? getImageSrc : undefined
                      }
                    />
                  </td>
                ))}
                <td>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteClick(item)}
                    disabled={isUpdating}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination>
          <Pagination.Prev
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          />
        </Pagination>
        <DeleteFoodConfirmationModal
          show={showDeleteModal}
          handleClose={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
          confirmDelete={confirmDelete}
        />
      </>
    );
  }
);

export default GenericItemTable;
