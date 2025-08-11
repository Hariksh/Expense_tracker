<h1 align="center"> Expense Tracker Mobile Application </h1>

<p align="center">
  <b>Hariksh Mahendra Suryawanashi</b> &mdash; <i>2025-B-04012007A</i>
</p>

---

## Problem Statement

Many people struggle to keep track of their daily expenses, leading to poor financial management and budgeting. Manual tracking is cumbersome and often neglected. There is a need for a **simple and effective mobile app** to record, categorize, and review expenses easily.

---

##Proposed Solution

A mobile application that allows users to quickly add their expenses with details like **amount, category, date, and notes**. The app displays a list of all expenses, provides filtering options, and summarizes spending by category. Data is stored locally for offline use, ensuring easy and quick access.

---

## Key Features

-  **Add new expenses** with amount, category, date, and notes
-  **View all expenses** in a sorted, scrollable list
-  **Filter expenses** by date range and category
-  **Edit and delete** expense entries
-  **Visual summary** of spending by category <sub>(charts optional)</sub>
-  **Data persistence** using local storage (AsyncStorage) for offline access

---

##  Target Users

Anyone who wants to manage personal finances effectively, including:

- Students
- Working professionals
- Families

---

##  Technology Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Frontend      | React Native with Expo                          |
| State         | React Context or Redux                          |
| Storage       | AsyncStorage for local data persistence         |
| Navigation    | React Navigation                                |
| UI Components | React Native Paper or NativeBase                |
| Charting      | React Native Chart Kit or Victory Native (opt.) |

---

##  Expected Outcome

A fully functional mobile app that helps users **track daily expenses, view categorized spending, and manage their budget easily** with a simple and intuitive interface.

---

##  Timeline

| Week(s) | Tasks                                                           |
| ------- | --------------------------------------------------------------- |
| 1–2     | Project setup, create Add Expense form, implement local storage |
| 3–4     | Build expense list screen with edit and delete functionality    |
| 5       | Implement filtering by date and category                        |
| 6       | Add spending summary with charts (optional)                     |
| 7       | UI polishing and testing                                        |
| 8       | Final testing and deployment preparation                        |

---

## Additional Notes

- Focus on **clean and user-friendly UI** to encourage regular use.
- **Offline functionality** is a priority by using local storage without requiring backend integration.
- **Charts and data visualization** are optional features and can be added if time permits.
