# Inventory Count (PWA) — Store Counting App

A fast, offline-capable web app for inventory counts with Google Sheets (Apps Script) as the backend.  
It supports template-driven item lists, unit-of-measure (UoM) selection, offline queueing, background sync, and CSV export.

> **For testing and play-around purposes**  
> **User:** `play_around`  
> **Pass:** `1`

---

## ✨ Features

- **Template-based items** per store/storage area
- **Offline-first** PWA with background sync of pending counts
- **3 UoMs per item** (auto-match quantities by UoM name)
- **Duplicate UoMs suppressed** in CSV exports
- **Latest-in-day logic**: if multiple counts in a day, the most recent one is exported
- **CSV export** aligned with downstream import needs
- **Fast auth lookup** via credential sheet cache
- **Lightweight UI** for quick mobile use

---

## 🧩 Architecture Overview

- **Frontend:** Vanilla HTML/CSS/JS (single-page app)
- **Backend:** Google Apps Script (Web App) + Google Sheets
- **Storage:**  
  - Remote: Google Sheets (Template, Count_Log, Credentials, uofm, itemdetail)  
  - Local (offline): `localStorage` + queued POSTs
- **PWA:** `sw.js` service worker for caching & offline navigation

