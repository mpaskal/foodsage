import React, { useState } from "react";
import { Table, Button, FormControl, Pagination } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import { foodItemsState } from "../../recoil/foodItemsAtoms";
import InlineEditControl from "../Common/InlineEditControl";
import { processImage } from "../../utils/imageUtils";
import {
  formatDateForDisplay,
  processDateInput,
  calculateExpirationDate,
} from "../../utils/dateUtils";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { loggedInUserState } from "../../recoil/userAtoms";

const categories = [
  "Dairy",
  "Fresh",
  "Grains and Bread",
  "Packaged and Snack Foods",
  "Frozen Goods",
  "Other",
];

const moveToOptions = ["Consume", "Consumed", "Waste", "Donate"];

const storages = ["Fridge", "Freezer", "Pantry", "Cellar"];

const quantityMeasurementsByCategory = {
  Dairy: ["L", "Oz", "Item"],
  Fresh: ["Gr", "Oz", "Item", "Kg", "Lb"],
  "Grains and Bread": ["Item", "Kg", "Lb", "Gr", "Box"],
  "Packaged and Snack Foods": ["Item", "Box", "Kg", "Lb", "Gr"],
  "Frozen Goods": ["Kg", "Lb", "Item"],
  Other: ["Item", "Kg", "Lb", "L", "Oz", "Gr", "Box"],
};

const DonationItemTable = () => {
  const [donationItems, setFoodItems] = useRecoilState(foodItemsState);
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

  // Filtering items based on the search query
  const filteredFoodItems = React.useMemo(() => {
    return donationItems.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [donationItems, searchQuery]);

  // Sorting the filtered items
  const sortedFoodItems = React.useMemo(() => {
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

  // Paginating the sorted and filtered items
  const paginatedFoodItems = React.useMemo(() => {
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

  const handleInputChange = (id, field, value) => {
    let updates = { [field]: value };

    if (field === "purchasedDate" || field === "expirationDate") {
      updates[field] = processDateInput(value);
    }

    const itemToUpdate = donationItems.find((item) => item._id === id);
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

    if (field === "storage") {
      updates["expirationDate"] = calculateExpirationDate(
        itemToUpdate.category,
        value,
        itemToUpdate.purchasedDate
      );
    }

    if (field === "purchasedDate") {
      updates["expirationDate"] = calculateExpirationDate(
        itemToUpdate.category,
        itemToUpdate.storage,
        value
      );
    }

    const updatedItems = donationItems.map((item) =>
      item._id === id ? { ...item, ...updates } : item
    );
    setFoodItems(updatedItems);

    Object.keys(updates).forEach((updateField) => {
      saveChanges(id, updateField, updates[updateField]);
    });
  };

  const saveChanges = async (id, field, value) => {
    try {
      const response = await fetch("/api/donationitems/update/" + id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loggedInUser.token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) {
        throw new Error("Failed to save changes");
      }
      const data = await response.json();
      console.log("Save successful:", data);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleDelete = (itemToDelete) => {
    setItemToDelete(itemToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch("/api/donationitems/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loggedInUser.token}`,
        },
        body: JSON.stringify({ _id: itemToDelete._id }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      setFoodItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemToDelete._id)
      );
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
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
      const updatedItems = donationItems.map((item) =>
        item._id === id ? { ...item, image: base64Data } : item
      );
      setFoodItems(updatedItems);
      saveChanges(id, "image", base64Data);
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
            <th onClick={() => requestSort("moveTo")}>
              Move {getSortIndicator("moveTo")}
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
                    handleInputChange(item._id, "name", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={categories}
                  value={item.category || ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "category", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="number"
                  value={item.quantity ? item.quantity.toString() : ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "quantity", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={quantityMeasurementsByCategory[item.category] || []}
                  value={item.quantityMeasurement || ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "quantityMeasurement", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={storages}
                  value={item.storage || ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "storage", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="number"
                  value={item.cost ? item.cost.toString() : ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "cost", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  value={item.source || ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "source", value)
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
                    handleInputChange(item._id, "expirationDate", value)
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
                    handleInputChange(item._id, "purchasedDate", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="number"
                  value={item.consumed ? item.consumed.toString() : "0"}
                  onChange={(value) =>
                    handleInputChange(item._id, "consumed", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={moveToOptions}
                  value={item.moveTo || "Consume"}
                  onChange={(value) =>
                    handleInputChange(item._id, "moveTo", value)
                  }
                />
              </td>
              <td>
                <Button variant="danger" onClick={() => handleDelete(item)}>
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
        handleClose={() => setShowDeleteModal(false)}
        confirmDelete={confirmDelete}
      />
    </>
  );
};

export default DonationItemTable;
