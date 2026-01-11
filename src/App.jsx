import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./PetFood/Dashboard";
import AddItemForm from "./PetFood/AddItemForm";
import Inventory from "./PetFood/Inventory";
import Totals from "./PetFood/Totals";
import Transactions from "./PetFood/Transactions";
import History from "./PetFood/History";
import ProtectedRoute from "./component/ProtectedRoute";
import { ItemsProvider } from "./context/ItemsContext";
import SnackList from "./Snacks/SnackList";
import AddSnack from "./Snacks/AddSnacks";
import { SnacksProvider } from "./context/SnacksContext";
import TotalSold from "./Snacks/TotalSold";
import SalesHistory from "./Snacks/SalesHistory";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TransactionProvider } from "./context/TransactionContext";
import Browse from "./PetFood/Browse";

function App() {
  return (
    <ItemsProvider>
      <TransactionProvider>
        <SnacksProvider>
          <>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-item"
                element={
                  <ProtectedRoute>
                    <AddItemForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/totals"
                element={
                  <ProtectedRoute>
                    <Totals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/browse"
                element={
                  <ProtectedRoute>
                    <Browse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/snacklist"
                element={
                  <ProtectedRoute>
                    <SnackList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/addsnack"
                element={
                  <ProtectedRoute>
                    <AddSnack />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/snacksold"
                element={
                  <ProtectedRoute>
                    <TotalSold />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/snackhistory"
                element={
                  <ProtectedRoute>
                    <SalesHistory />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>

            {/* Toast container */}
            <ToastContainer
              position="bottom-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="dark"
            />
          </>
        </SnacksProvider>
      </TransactionProvider>
    </ItemsProvider>
  );
}

export default App;
