# Expense Tracker Application

<p align="center">
  <b>Hariksh Mahendra Suryawanashi</b> &mdash; <i>2025-B-04012007A</i>
</p>
<p align="center">
  <a href="https://drive.google.com/file/d/12FrK3MzIxHtl2s1XPWdjuuOfunEPOYLe/view?usp=drive_link"><b>Watch Demo Video</b></a>
</p>

---

## Overview

The **Expense Tracker** is a full-stack mobile application designed to help users manage their personal finances. It allows users to record daily expenses, categorize them, and view their spending history. The application features a robust backend for secure data storage and authentication, coupled with a responsive and intuitive React Native frontend.

---

## Key Features

- **User Authentication**: Secure registration and login using JWT.
- **Expense Management**: Add, edit, and delete expenses with details like amount, category, date, and notes.
- **Categorization**: Organize expenses into categories for better tracking.
- **History**: View a scrollable list of all past expenses.
- **Filtering**: Filter expenses by date and category (planned).
- **Data Persistence**: All data is stored securely in a MySQL database.
- **Dark Mode**: Toggle between light and dark themes for better visibility.
- **Virtual Members**: Add members to groups without requiring them to have an account, perfect for splitting bills with non-users.

---

## Technology Stack

### Frontend
- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Navigation**: [React Navigation](https://reactnavigation.org/)
- **UI Components**: [React Native Paper](https://callstack.github.io/react-native-paper/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MySQL](https://www.mysql.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/)

---

## Project Structure

```
Expense_tracker/
├── Backend/                # Express.js API and Prisma ORM
│   ├── prisma/             # Database schema and migrations
│   ├── src/                # Source code (controllers, routes, etc.)
│   └── package.json
├── Frontend/               # React Native Expo project
│   ├── expense_tracker/    # Main frontend code
│   └── package.json
└── README.md               # Project documentation
```

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/) installed and running
- [Expo Go](https://expo.dev/client) app on your mobile device (or an emulator)

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd Backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    - Create a `.env` file in the `Backend` directory.
    - Add your `DATABASE_URL` and `JWT_SECRET`:
      ```env
      DATABASE_URL="mysql://user:password@localhost:3306/expense_tracker"
      JWT_SECRET="dev_secret_change_me"
      ```
      > **Note for Grader**: Please use `dev_secret_change_me` as the JWT secret for testing purposes.

4.  Run database migrations:
    ```bash
    npx prisma migrate dev
    ```

5.  Start the server:
    ```bash
    npm start
    # or for development with nodemon
    npm run dev
    ```
    The server should be running on `http://localhost:3000` (or your configured port).

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd Frontend/expense_tracker
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure API URL:
    - Ensure the frontend is pointing to your local backend IP address (not `localhost` if testing on a physical device).
    - Update the base URL in your API service file (e.g., `src/services/api.js` or similar).

4.  Start the Expo development server:
    ```bash
    npm start
    ```

5.  Run on device/emulator:
    - **Physical Device**: Scan the QR code with the Expo Go app.
    - **Emulator**: Press `a` for Android or `i` for iOS (macOS only).

---



## License

This project is for educational purposes.
