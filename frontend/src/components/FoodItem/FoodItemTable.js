import React, { useState, useMemo } from "react";
import { Table, Button, FormControl, Pagination } from "react-bootstrap";
import { useRecoilValue } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import InlineEditControl from "../Common/InlineEditControl";
import { processImage } from "../../utils/imageUtils";
import {
  formatDateForDisplay,
  processDateInput,
  calculateExpirationDate,
} from "../../utils/dateUtils";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { format, parseISO } from "date-fns";

const categories = [
  "Dairy",
  "Fresh",
  "Grains and Bread",
  "Packaged and Snack Foods",
  "Frozen Goods",
  "Other",
];
const statusOptions = [
  "Active",
  "Inactive",
  "Consumed",
  "Waste",
  "Donation",
  "Donated",
];
const storages = ["Fridge", "Freezer", "Pantry", "Cellar"];
const quantityMeasurementsByCategory = {
  Dairy: ["L", "Oz", "Item"],
  Fresh: ["Gr", "Oz", "Item", "Kg", "Lb"],
  "Grains and Bread": ["Item", "Kg", "Lb", "Gr", "Box"],
  "Packaged and Snack Foods": ["Item", "Box", "Kg", "Lb", "Gr"],
  "Frozen Goods": ["Kg", "Lb", "Item"],
  Other: ["Item", "Kg", "Lb", "L", "Oz", "Gr", "Box"],
};

const FoodItemTable = ({
  foodItems,
  handleInputChange,
  handleDelete,
  isUpdating,
}) => {
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const loggedInUser = useRecoilValue(loggedInUserState);

  const [sortConfig, setSortConfig] = useState({
    key: "expirationDate",
    direction: "ascending",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFoodItems = useMemo(() => {
    return foodItems.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [foodItems, searchQuery]);

  const sortedFoodItems = useMemo(() => {
    let sortableItems = [...filteredFoodItems];
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
  }, [filteredFoodItems, sortConfig]);

  const paginatedFoodItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedFoodItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedFoodItems, currentPage]);

  const totalPages = Math.ceil(filteredFoodItems.length / itemsPerPage);

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

  const handleLocalInputChange = (id, field, value) => {
    let updates = { [field]: value };

    if (field === "purchasedDate" || field === "expirationDate") {
      updates[field] = processDateInput(value);
    }

    const itemToUpdate = foodItems.find((item) => item._id === id);
    if (!itemToUpdate) return;

    if (field === "category") {
      const defaultMeasurement = quantityMeasurementsByCategory[value][0];
      updates["quantityMeasurement"] = defaultMeasurement;
      updates["expirationDate"] = calculateExpirationDate(
        value,
        updates.storage || itemToUpdate.storage,
        itemToUpdate.purchasedDate
      );
    }

    if (field === "storage" || field === "purchasedDate") {
      updates["expirationDate"] = calculateExpirationDate(
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
      } else if (value === "Waste" || value === "Donate") {
        updates.donationDate = new Date().toISOString();
      }
    }

    handleInputChange(id, updates);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await handleDelete(itemToDelete._id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const getImageSrc = (image) => {
    if (image && typeof image === "string" && image.length > 0) {
      if (image.startsWith("data:image")) {
        return image;
      }
      if (image.startsWith("/9j/")) {
        return `data:image/jpeg;base64,${image}`;
      } else if (image.startsWith("iVBORw0KGgo")) {
        return `data:image/png;base64,${image}`;
      } else {
        return `data:image/jpeg;base64,${image}`;
      }
    }
    return `Bad image`;
  };

  const getExpirationDateStyle = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const timeDiff = expDate - today;
    const daysToExpire = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return expDate < today
      ? { backgroundColor: "red", color: "white" }
      : daysToExpire <= 1
      ? { backgroundColor: "yellow", color: "black" }
      : { backgroundColor: "green", color: "white" };
  };

  const handleFileChange = async (id, file) => {
    try {
      const base64Data = await processImage(file);
      handleInputChange(id, { image: base64Data });
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

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
            <th onClick={() => requestSort("image")}>
              Image {getSortIndicator("image")}
            </th>
            <th onClick={() => requestSort("name")}>
              Name {getSortIndicator("name")}
            </th>
            <th onClick={() => requestSort("category")}>
              Category {getSortIndicator("category")}
            </th>
            <th onClick={() => requestSort("quantity")}>
              Qty {getSortIndicator("quantity")}
            </th>
            <th onClick={() => requestSort("quantityMeasurement")}>
              Meas {getSortIndicator("quantityMeasurement")}
            </th>
            <th onClick={() => requestSort("storage")}>
              Storage {getSortIndicator("storage")}
            </th>
            <th onClick={() => requestSort("cost")}>
              Cost {getSortIndicator("cost")}
            </th>
            <th onClick={() => requestSort("source")}>
              Source {getSortIndicator("source")}
            </th>
            <th onClick={() => requestSort("expirationDate")}>
              Expiration Date {getSortIndicator("expirationDate")}
            </th>
            <th onClick={() => requestSort("purchasedDate")}>
              Purchased Date {getSortIndicator("purchasedDate")}
            </th>
            <th onClick={() => requestSort("consumed")}>
              Consumed (%) {getSortIndicator("consumed")}
            </th>
            <th onClick={() => requestSort("status")}>
              Move {getSortIndicator("status")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedFoodItems.map((item) => (
            <tr key={item._id}>
              <td>
                <InlineEditControl
                  type="file"
                  value={item.image || ""}
                  onChange={(file) => handleFileChange(item._id, file)}
                  getImageSrc={getImageSrc}
                />
              </td>
              <td>
                <InlineEditControl
                  value={item.name || ""}
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "name", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={categories}
                  value={item.category || ""}
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "category", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="number"
                  value={item.quantity ? item.quantity.toString() : ""}
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "quantity", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={quantityMeasurementsByCategory[item.category] || []}
                  value={item.quantityMeasurement || ""}
                  onChange={(value) =>
                    handleLocalInputChange(
                      item._id,
                      "quantityMeasurement",
                      value
                    )
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={storages}
                  value={item.storage || ""}
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "storage", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="number"
                  value={item.cost ? item.cost.toString() : ""}
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "cost", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  value={item.source || ""}
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "source", value)
                  }
                />
              </td>
              <td style={getExpirationDateStyle(item.expirationDate)}>
                <InlineEditControl
                  type="date"
                  value={
                    item.expirationDate
                      ? formatDateForDisplay(item.expirationDate)
                      : ""
                  }
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "expirationDate", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="date"
                  value={
                    item.purchasedDate
                      ? formatDateForDisplay(item.purchasedDate)
                      : ""
                  }
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "purchasedDate", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="number"
                  value={item.consumed ? item.consumed.toString() : "0"}
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "consumed", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={statusOptions}
                  value={item.status || "Consume"}
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "status", value)
                  }
                />
              </td>
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
      <DeleteConfirmationModal
        show={showDeleteModal}
        handleClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        confirmDelete={confirmDelete}
      />
    </>
  );
};

export default FoodItemTable;
