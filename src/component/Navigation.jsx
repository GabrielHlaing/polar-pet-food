import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "../App.css";
import {
  FaBoxes,
  FaChartBar,
  FaShoppingCart,
  FaHistory,
  FaPlus,
  FaTachometerAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaFolderOpen,
  FaList,
  FaCalculator,
} from "react-icons/fa";
import { useState } from "react";

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isSnacks = location.pathname.includes("snack");

  const handleLogout = async () => {
    await signOut(auth);
    window.location.replace("/login");
  };

  return (
    <div className="navbar">
      <div className="nav-header">
        <h1 className="navh1">Polar Pet Food & Accessories</h1>

        <div className="nav-top-toggle">
          <button
            className={`toggle-button ${!isSnacks ? "active" : ""}`}
            onClick={() => navigate("/inventory", { replace: true })}
          >
            Pet Food
          </button>
          <button
            className={`toggle-button ${isSnacks ? "active" : ""}`}
            onClick={() => navigate("/snacklist")}
          >
            Snacks
          </button>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Collapsible menu */}
      <div className={`nav-items ${menuOpen ? "open" : ""}`}>
        {isSnacks ? (
          <>
            <button
              className="nav-button"
              onClick={() => navigate("/snacklist", { replace: true })}
            >
              <FaList />
              Snacks List
            </button>
            <button
              className="nav-button"
              onClick={() => navigate("/addsnack", { replace: true })}
            >
              <FaPlus />
              Add Snacks
            </button>
            <button
              className="nav-button"
              onClick={() => navigate("/snacksold", { replace: true })}
            >
              <FaCalculator />
              Calculate Sold
            </button>
            <button
              className="nav-button"
              onClick={() => navigate("/snackhistory", { replace: true })}
            >
              <FaHistory />
              Sales History
            </button>
          </>
        ) : (
          <>
            <button
              className="nav-button"
              onClick={() => navigate("/dashboard", { replace: true })}
            >
              <FaTachometerAlt /> Dashboard
            </button>
            <button
              className="nav-button"
              onClick={() => navigate("/inventory", { replace: true })}
            >
              <FaBoxes /> Inventory
            </button>
            <button
              className="nav-button"
              onClick={() => navigate("/totals", { replace: true })}
            >
              <FaChartBar /> Totals
            </button>
            <button
              className="nav-button"
              onClick={() => navigate("/browse", { replace: true })}
            >
              <FaFolderOpen /> Browse
            </button>
            <button
              className="nav-button"
              onClick={() => navigate("/transactions", { replace: true })}
            >
              <FaShoppingCart /> Purchase/Sale
            </button>
            <button
              className="nav-button"
              onClick={() => navigate("/history", { replace: true })}
            >
              <FaHistory /> History
            </button>
            <button
              className="nav-button"
              onClick={() => navigate("/add-item", { replace: true })}
            >
              <FaPlus /> Add Item
            </button>
          </>
        )}

        <button className="nav-button logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
      {menuOpen && (
        <div
          className="nav-overlay show"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default Navigation;
