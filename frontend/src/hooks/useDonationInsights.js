// src/hooks/useDonationInsights.js

import { useState, useCallback } from "react";
import api from "../utils/api";

const useDonationInsights = () => {
  const [donationItems, setDonationItems] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDonationItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/donation/items");
      setDonationItems(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateInsights = useCallback(() => {
    const totalDonations = donationItems.length;
    const donatedItems = donationItems.filter(
      (item) => item.status === "Donated"
    ).length;
    const pendingDonations = totalDonations - donatedItems;
    const donationRate = (donatedItems / totalDonations) * 100 || 0;

    setInsights({
      totalDonations,
      donatedItems,
      pendingDonations,
      donationRate,
    });
  }, [donationItems]);

  return {
    donationItems,
    insights,
    loading,
    error,
    fetchDonationItems,
    calculateInsights,
  };
};

export default useDonationInsights;
