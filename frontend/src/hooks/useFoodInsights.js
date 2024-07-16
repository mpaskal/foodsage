import { useState, useEffect } from "react";
import axios from "axios";

const useFoodInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const startDate = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString();
        const endDate = new Date().toISOString();
        const response = await axios.get("/api/food/insights", {
          params: { startDate, endDate },
        });
        setInsights(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return { insights, loading, error };
};

export default useFoodInsights;
