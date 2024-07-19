import React, { useState, useMemo } from "react";
import { Table, Button, FormControl, Pagination } from "react-bootstrap";
import { useRecoilValue } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import InlineEditControl from "../Common/InlineEditControl";
import { processImage } from "../../utils/imageUtils";
import { formatDateForDisplay, processDateInput } from "../../utils/dateUtils";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const categories = [
  "Dairy",
  "Fresh",
  "Grains and Bread",
  "Packaged and Snack Foods",
  "Frozen Goods",
  "Other",
];
const statusOptions = ["Active", "Inactive", "Waste", "Consumed", "Donation"];
const storages = ["Fridge", "Freezer", "Pantry", "Cellar"];
const quantityMeasurementsByCategory = {
  Dairy: ["L", "Oz", "Item"],
  Fresh: ["Gr", "Oz", "Item", "Kg", "Lb"],
  "Grains and Bread": ["Item", "Kg", "Lb", "Gr", "Box"],
  "Packaged and Snack Foods": ["Item", "Box", "Kg", "Lb", "Gr"],
  "Frozen Goods": ["Kg", "Lb", "Item"],
  Other: ["Item", "Kg", "Lb", "L", "Oz", "Gr", "Box"],
};

const WasteItemTable = ({
  wasteItems,
  handleInputChange,
  handleDelete,
  isUpdating,
}) => {
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const loggedInUser = useRecoilValue(loggedInUserState);

  const [sortConfig, setSortConfig] = useState({
    key: "dateRecorded",
    direction: "descending",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredWasteItems = useMemo(() => {
    return wasteItems.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [wasteItems, searchQuery]);

  const sortedWasteItems = useMemo(() => {
    let sortableItems = [...filteredWasteItems];
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
  }, [filteredWasteItems, sortConfig]);

  const paginatedWasteItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedWasteItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedWasteItems, currentPage]);

  const totalPages = Math.ceil(filteredWasteItems.length / itemsPerPage);

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

    if (field === "dateRecorded" || field === "expirationDate") {
      updates[field] = processDateInput(value);
    }

    if (field === "status" && value !== "Waste") {
      // Handle status change from Waste to another status
      // You might want to remove the item from the waste list or update its status
      handleDelete(id);
      return;
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
            <th onClick={() => requestSort("wasteCost")}>
              Waste Cost {getSortIndicator("wasteCost")}
            </th>
            <th onClick={() => requestSort("expirationDate")}>
              Expiration Date {getSortIndicator("expirationDate")}
            </th>
            <th onClick={() => requestSort("dateRecorded")}>
              Date Recorded {getSortIndicator("dateRecorded")}
            </th>
            <th onClick={() => requestSort("percentWasted")}>
              % Wasted {getSortIndicator("percentWasted")}
            </th>
            <th onClick={() => requestSort("status")}>
              Status {getSortIndicator("status")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedWasteItems.map((item) => (
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
                  type="number"
                  value={item.wasteCost ? item.wasteCost.toString() : ""}
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "wasteCost", value)
                  }
                />
              </td>
              <td>
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
                    item.dateRecorded
                      ? formatDateForDisplay(item.dateRecorded)
                      : ""
                  }
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "dateRecorded", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="number"
                  value={
                    item.percentWasted ? item.percentWasted.toString() : "0"
                  }
                  onChange={(value) =>
                    handleLocalInputChange(item._id, "percentWasted", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={statusOptions}
                  value={item.status || "Waste"}
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

export default WasteItemTable;
