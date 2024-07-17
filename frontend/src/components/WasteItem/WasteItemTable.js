// src/components/WasteItem/WasteItemTable.jsx

import React, { useState, useMemo } from "react";
import { Table, Button, FormControl, Pagination } from "react-bootstrap";
import { useRecoilValue } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import InlineEditControl from "../Common/InlineEditControl";
import { formatDateForDisplay } from "../../utils/dateUtils";

const WasteItemTable = ({
  wasteItems,
  handleInputChange,
  handleDelete,
  isUpdating,
}) => {
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
            <th onClick={() => requestSort("category")}>
              Category {getSortIndicator("category")}
            </th>
            <th onClick={() => requestSort("reason")}>
              Reason {getSortIndicator("reason")}
            </th>
            <th onClick={() => requestSort("dateRecorded")}>
              Date Recorded {getSortIndicator("dateRecorded")}
            </th>
            <th onClick={() => requestSort("expirationDate")}>
              Expiration Date {getSortIndicator("expirationDate")}
            </th>
            <th onClick={() => requestSort("wasteCost")}>
              Waste Cost {getSortIndicator("wasteCost")}
            </th>
            <th onClick={() => requestSort("quantity")}>
              Quantity {getSortIndicator("quantity")}
            </th>
            <th onClick={() => requestSort("percentWasted")}>
              % Wasted {getSortIndicator("percentWasted")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedWasteItems.map((item) => (
            <tr key={item._id}>
              <td>{item.category}</td>
              <td>{item.reason}</td>
              <td>{formatDateForDisplay(item.dateRecorded)}</td>
              <td>{formatDateForDisplay(item.expirationDate)}</td>
              <td>${item.wasteCost.toFixed(2)}</td>
              <td>{`${item.quantity} ${item.quantityUnit}`}</td>
              <td>{`${item.percentWasted}%`}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(item._id)}
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
    </>
  );
};

export default WasteItemTable;
