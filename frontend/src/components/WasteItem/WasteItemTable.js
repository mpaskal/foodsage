import React from "react";
import GenericItemTable from "../Common/GenericItemTable";
import {
  statusOptions,
  quantityMeasurementsByCategory,
  sharedTableColumns,
} from "../../utils/constants";

const WasteItemTable = ({ wasteItems, ...props }) => (
  <GenericItemTable
    items={wasteItems} // Change this line
    {...props}
    tableColumns={sharedTableColumns}
    itemType="food"
    statusOptions={statusOptions}
    quantityMeasurementsByCategory={quantityMeasurementsByCategory}
  />
);

export default WasteItemTable;
