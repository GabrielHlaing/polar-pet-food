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

  const fetchSnacks = async () => {
    setLoading(true);
    try {
      const snackCollection = await getDocs(collection(db, "snacks"));
      const data = snackCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSnacks(data || []);
    } catch (err) {
      console.error("Error fetching snacks: ", err);
      setSnacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnacks();
  }, []);

  return (
    <SnacksContext.Provider value={{ snacks, setSnacks, fetchSnacks, loading }}>
      {children}
    </SnacksContext.Provider>
  );
};
