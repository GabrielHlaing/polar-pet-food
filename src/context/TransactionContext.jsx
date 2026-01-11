import { createContext, useContext, useState, useEffect } from "react";

// Create context
const TransactionContext = createContext();

// Custom hook
export const useTransaction = () => useContext(TransactionContext);

// Provider
export const TransactionProvider = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Add an item to selection
  const addItem = (item) => {
    setSelectedItems((prev) => {
      // avoid duplicates
      if (prev.find((i) => i.code === item.code)) return prev;
      return [...prev, { ...item, quantity: 1, remaining: item.quantity ?? 0 }];
    });
  };

  // Remove an item from selection
  const removeItem = (code) => {
    setSelectedItems((prev) => prev.filter((i) => i.code !== code));
  };

  // Clear all selected items
  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Update a selected item by code (field can be quantity, price, salePrice, expiryDate, etc.)
  const updateItem = (code, field, value) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.code === code ? { ...i, [field]: value } : i))
    );
  };

  // ✅ Check if an item is already selected (for Browse page)
  const isItemSelected = (code) => selectedItems.some((i) => i.code === code);

  // Listen for "updateSelectedItems" events (used by Transactions.js for direct field updates)
  useEffect(() => {
    const handler = (e) => {
      if (Array.isArray(e.detail)) setSelectedItems(e.detail);
    };
    window.addEventListener("updateSelectedItems", handler);
    return () => window.removeEventListener("updateSelectedItems", handler);
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        selectedItems,
        addItem,
        removeItem,
        clearSelection,
        updateItem,
        isItemSelected,
        setSelectedItems, // optional direct setter
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
