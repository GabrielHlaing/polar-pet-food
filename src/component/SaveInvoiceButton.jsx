import React from "react";
import html2canvas from "html2canvas";
import "../App.css";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

function SaveInvoiceButton({ targetId, filename = "invoice.png" }) {
  const handleSave = async () => {
    const target = document.getElementById(targetId);
    if (!target) {
      console.error("Target element not found:", targetId);
      return;
    }

    try {
      // Hide unwanted UI elements
      const buttons = target.querySelectorAll(
        ".delete-invoice, .save-btn, .edit-btn, .profit-row, .mobile-profit"
      );
      buttons.forEach((btn) => (btn.style.display = "none"));

      // Clone invoice for clean rendering
      const screenWidth =
        window.innerWidth < 800 ? window.innerWidth - 40 : 800;

      const styledClone = target.cloneNode(true);

      // ======== PREMIUM CARD STYLE ========
      styledClone.style.width = `${screenWidth}px`;
      styledClone.style.padding = screenWidth < 600 ? "20px" : "40px";
      styledClone.style.margin = "0 auto";
      styledClone.style.background =
        "linear-gradient(90deg, #e7eff6ff 0%, #ffffff 50%)";
      styledClone.style.borderRadius = "16px";

      styledClone.style.border = "2px solid #73A5DE";

      styledClone.style.fontFamily = "Poppins, sans-serif";
      styledClone.style.color = "#333";
      styledClone.style.position = "relative";

      // ======== BRAND TOP BAR ========
      const topBar = document.createElement("div");
      topBar.style.height = "3px";
      topBar.style.width = "100%";
      topBar.style.background = "#1565c0";
      topBar.style.borderRadius = "14px 14px 0 0";
      topBar.style.marginBottom = "10px";
      styledClone.prepend(topBar);

      // ======== IMPROVED RESPONSIVE HEADER ========
      const header = document.createElement("div");
      header.style.position = "relative";
      header.style.zIndex = "10";
      header.style.marginBottom = "10px";

      // same width as invoice
      header.style.width = `${screenWidth - 40}px`;

      // FLEX CONTAINER
      header.innerHTML = `
  <div style="
    display:flex;
    flex-wrap:wrap;
    justify-content:space-between;
    align-items:center;
    gap:8px;
    width:100%;
  ">

    <!-- Logo + Brand -->
    <div style="
      display:flex;
      flex-direction:row;
      align-items:center;
      gap:12px;
      min-width:220px;
      flex:1 1 auto;
    ">
      <img src="/logo512.png"
        style="
          width:60px;
          height:60px;
          border-radius:50%;
          object-fit:cover;
          background: white;
          border: 2px solid #c9dfff;
          flex-shrink:0;
        "
      />

      <div style="line-height:1.2;">
        <h2 style="margin:0; font-size:20px; color:#1565c0; font-weight:700;">
          Polar Pet Food &amp; Accessories
        </h2>
      </div>
    </div>

    <!-- Contact Section -->
    <div style="
      text-align:center;
      min-width:180px;
      flex:1 1 auto;
    ">
      <p style="margin:0; font-size:16px;">
        <strong>Phone/Viber:</strong>
      </p>
      <p style="font-size:14px;">09 953 772 926 / 09 9765 17080</p>
    </div>

  </div>
`;

      styledClone.prepend(header);

      // ======== FOOTER ========
      const footer = document.createElement("div");
      footer.innerHTML = `
        <div style="text-align:center; margin-top:20px; padding-top:12px;
        font-size:14px; color:#555; border-top:2px solid #1565c0;">
          <i>Thanks for shopping with us!</i>
        </div>
      `;
      styledClone.appendChild(footer);

      // Hide off-screen for rendering
      styledClone.style.position = "absolute";
      styledClone.style.top = "-9999px";
      document.body.appendChild(styledClone);

      // Render to canvas
      const canvas = await html2canvas(styledClone, {
        backgroundColor: "#73A5DE",
        scale: 2,
      });

      document.body.removeChild(styledClone);
      buttons.forEach((btn) => (btn.style.display = "block"));

      // Save image
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = filename;
      link.click();

      toast.success("Invoice saved!");
    } catch (err) {
      toast.error("Error saving invoice");
      console.error(err);
    }
  };

  return (
    <button className="save-btn" onClick={handleSave}>
      <FaSave /> Save
    </button>
  );
}

export default SaveInvoiceButton;
