import React, { useState } from "react";
import { Table, Button, FormControl, Pagination } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import { foodItemsState } from "../../recoil/foodItemsAtoms";
import InlineEditControl from "../Common/InlineEditControl";
import { formatDateForDisplay } from "../../utils/dateUtils";
import { loggedInUserState } from "../../recoil/userAtoms";

const WasteItemTable = ({ handleMove, isUpdating }) => {
  const [wasteItems, setWasteItems] = useRecoilState(foodItemsState);
  const loggedInUser = useRecoilValue(loggedInUserState);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtering items based on the search query
  const filteredWasteItems = React.useMemo(() => {
    return wasteItems.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [wasteItems, searchQuery]);

  // Paginating the filtered items
  const paginatedWasteItems = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWasteItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWasteItems, currentPage]);

  const totalPages = Math.ceil(filteredWasteItems.length / itemsPerPage);

  const handleMoveItem = async (itemId, newMoveTo) => {
    await handleMove(itemId, newMoveTo);
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
        {/* Table content similar to FoodItemTable, but with fewer columns */}
      </Table>
      <Pagination>{/* Pagination similar to FoodItemTable */}</Pagination>
    </>
  );
};

export default WasteItemTable;
