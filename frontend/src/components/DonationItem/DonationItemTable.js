import React from "react";
import GenericItemTable from "../Common/GenericItemTable";
import {
  statusOptions,
  quantityMeasurementsByCategory,
  sharedTableColumns,
} from "../../utils/constants";

const DonationItemTable = ({ donationItems, ...props }) => (
  <GenericItemTable
    items={donationItems} // Change this line
    {...props}
    tableColumns={sharedTableColumns}
    itemType="food"
    statusOptions={statusOptions}
    quantityMeasurementsByCategory={quantityMeasurementsByCategory}
  />
);

export default DonationItemTable;
