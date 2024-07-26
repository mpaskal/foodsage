import React from "react";
import GenericItemTable from "../Common/GenericItemTable";
import {
  statusOptions,
  quantityMeasurementsByCategory,
  sharedTableColumns,
} from "../../utils/constants";

const FoodItemTable = React.memo(({ foodItems, ...props }) => (
  <GenericItemTable
    items={foodItems}
    {...props}
    tableColumns={sharedTableColumns}
    itemType="food"
    statusOptions={statusOptions}
    quantityMeasurementsByCategory={quantityMeasurementsByCategory}
  />
));

export default FoodItemTable;
