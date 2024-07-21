import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { foodItemsState } from "../recoil/foodItemsAtoms";
import api from "../utils/api";

export const useDashboard = () => {
  const setFoodItems = useSetRecoilState(foodItemsState);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/food/items");
        console.log("Dashboard API Response:", response.data);

        const items = response.data.data.map((item) => ({
          ...item,
          statusChangeDate: new Date(item.statusChangeDate),
          expirationDate: new Date(item.expirationDate),
          purchasedDate: new Date(item.purchasedDate),
        }));

        setFoodItems(items);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [setFoodItems]);
};
