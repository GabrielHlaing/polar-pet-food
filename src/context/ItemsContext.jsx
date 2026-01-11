import React, { createContext, useContext, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [itemsFetched, setItemsFetched] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyFetched, setHistoryFetched] = useState(false);

  const [availableMonths, setAvailableMonths] = useState([]); // For dropdown
  const historyCache = {}; // Cache by "YYYY-MM"

  // Fetch items (once)
  const fetchItems = async () => {
    if (itemsFetched) return;
    try {
      setFetching(true);
      const snapshot = await getDocs(collection(db, "items"));
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setFetching(false);
      setItemsFetched(true);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  // 🔹 Fetch invoices for a specific month
  const fetchHistoryByMonth = async (year, month) => {
    // 🧠 Safety: Validate inputs
    if (!year || !month || isNaN(year) || isNaN(month)) {
      console.warn("⚠️ Invalid year/month passed to fetchHistoryByMonth:", {
        year,
        month,
      });
      return;
    }

    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    // ✅ If cached, reuse it
    if (historyCache[monthKey]) {
      setHistory(historyCache[monthKey]);
      setHistoryFetched(true);
      return;
    }

    try {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1); // next month's 1st day

      // 🔹 Defensive: Ensure valid Date objects
      if (isNaN(start) || isNaN(end)) {
        console.warn("⚠️ Skipping invalid date range in fetchHistoryByMonth");
        return;
      }

      const historyRef = collection(db, "history");
      const q = query(
        historyRef,
        where("date", ">=", start.toISOString()),
        where("date", "<", end.toISOString()),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(q);
      const invoices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ Sort by fullDate if available
      invoices.sort((a, b) => {
        const dateA = a.fullDate ? new Date(a.fullDate) : new Date(a.date);
        const dateB = b.fullDate ? new Date(b.fullDate) : new Date(b.date);
        return dateB - dateA;
      });

      setHistory(invoices);
      setHistoryFetched(true);
      historyCache[monthKey] = invoices;
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // 🔹 Get all months that have invoices (for dropdown)
  const fetchAvailableMonths = async () => {
    try {
      const snapshot = await getDocs(collection(db, "history"));
      const dates = snapshot.docs.map((doc) => new Date(doc.data().date));
      const months = Array.from(
        new Set(
          dates.map(
            (d) =>
              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
          )
        )
      ).sort((a, b) => (a < b ? 1 : -1)); // newest first

      setAvailableMonths(months);
    } catch (err) {
      console.error("Error fetching months:", err);
    }
  };

  // Keep other functions unchanged
  const getSortedAndFilteredItems = ({
    nameFilter = "",
    sortField = "",
    sortOrder = "asc",
  }) => {
    let data = [...items];
    if (nameFilter) {
      const filterLower = nameFilter.toLowerCase();
      data = data.filter((item) =>
        item.name.toLowerCase().includes(filterLower)
      );
    }

    if (sortField) {
      data.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === "expiryDate") {
          valA = valA ? new Date(valA) : new Date(8640000000000000);
          valB = valB ? new Date(valB) : new Date(8640000000000000);
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    } else {
      data.sort((a, b) => {
        const brandCompare = a.brand.localeCompare(b.brand);
        if (brandCompare !== 0) return brandCompare;
        return a.code.localeCompare(b.code);
      });
    }

    return data;
  };

  return (
    <ItemsContext.Provider
      value={{
        items,
        setItems,
        setItemsFetched,
        fetchItems,
        setHistoryFetched,
        getSortedAndFilteredItems,
        setHistory,
        fetchHistoryByMonth,
        fetchAvailableMonths,
        availableMonths,
        fetching,
        history,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => useContext(ItemsContext);
