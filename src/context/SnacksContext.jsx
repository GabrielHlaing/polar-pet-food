import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Create context
const SnacksContext = createContext();

// Custom hook to use the context
export const useSnacks = () => useContext(SnacksContext);

// Provider component
export const SnacksProvider = ({ children }) => {
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch snacks from Firestore
  const fetchSnacks = async () => {
    setLoading(true);
    try {
      const snackCollection = await getDocs(collection(db, "snacks"));
      setSnacks(
        snackCollection.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (err) {
      console.error("Error fetching snacks: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SnacksContext.Provider value={{ snacks, setSnacks, fetchSnacks, loading }}>
      {children}
    </SnacksContext.Provider>
  );
};
