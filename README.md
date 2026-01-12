# Polar Inventory

Polar Inventory is a lightweight, customized and invoicing web application built for small retail pet-food-shops.  
It is designed to work reliably in low-connectivity environments while still syncing data to the cloud when online.

The system supports purchase and sale transactions, invoice history, profit tracking, and invoice image export.

---

## Features

- Inventory management (items, quantity, prices, expiry dates)
- Purchase and sale transactions
- Automatic stock updates
- Invoice history with monthly grouping
- Profit calculation per invoice
- Responsive design (desktop & mobile)
- Export invoices as PNG images
- Offline-first friendly workflow
- Firebase Firestore backend

---

## Tech Stack

Frontend

- React
- React Router
- Context API
- HTML2Canvas (invoice export)
- React Icons
- React Toastify

Backend / Services

- Firebase Firestore
- Firebase Authentication

Styling

- Custom CSS

---

## Project Structure

src/

- components/ Reusable UI components
- context/ Global state (Items, Transactions, History)
- pages/ Main pages (Browse, Transactions, History)
- firebase.js Firebase configuration
- App.js App entry
- App.css Global styles

public/

- logo512.png App / invoice logo

---

## Core Concepts

### Inventory Items

Each item contains:

- code (unique identifier)
- name
- quantity
- purchasePrice
- unitPrice
- expiryDate

### Transactions

Two modes:

- purchase: increases stock and updates prices
- sale: decreases stock and records profit

### History

Each invoice stored in the history collection includes:

- invoice number
- date and full timestamp
- type (purchase or sale)
- supplier (purchase only)
- items list
- total profit (for sales)

---

## Invoice Export

Invoices can be saved as PNG images using html2canvas.

Exported invoices include:

- Brand header and logo
- Invoice number and date
- Item list
- Grand total and profit
- Clean, printable design
- Responsive layout for mobile and desktop

UI-only elements (edit, delete, buttons) are automatically removed before export.

---

## Offline Behavior

- App works normally when offline
- Changes are synced when connection is restored
- Designed for small shops with unstable internet

---

## Setup

1. Clone the repository

```
   git clone https://github.com/GabrielHlaing/polar-inventory.git

   cd polar-inventory
```

2. Install dependencies

```
   npm install
```

3. Create Firebase config

   Add your Firebase credentials in src/firebase.js

4. Start development server

```
   npm start
```

---

## Environment Variables (Example)

REACT_APP_FIREBASE_API_KEY=xxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxxx
REACT_APP_FIREBASE_PROJECT_ID=xxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxxx
REACT_APP_FIREBASE_APP_ID=xxxx

---

## Known Limitations

- No role-based access control
- No server-side profit aggregation (client calculated)
- Designed for single-store usage

---

## Future Improvements

- Monthly and yearly profit dashboards
- PDF invoice export
- User roles (admin / staff)
- Barcode support
- Cloud backup control

---

## License

This project is private / internal-use by default.

---

## Author

Polar Inventory  
Built for real-world retail usage.
