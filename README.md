# Igloo Asset Management System

A full-stack Asset Management System designed to manage company assets, asset assignments, transfers, returns, verification, outlets, users, check-ins, and operational workflows through a web application and a dedicated mobile application.

The system consists of a **Backend API**, **Web Application**, and **Android Mobile Application**, all connected to a centralized production backend and database.

---

## 📌 Project Overview

The **Igloo Asset Management System (AMS)** provides a centralized platform for managing organizational assets throughout their lifecycle.

The system supports:

* Asset registration and management
* Asset assignment and transfer
* Asset return and disposal
* Asset authorization
* Asset verification
* QR-based asset identification
* Verification mapping
* Outlet registration and management
* Existing asset verification for outlets
* User management
* Role-based access control
* Check-in and attendance workflows
* Regional, district, distributor, and outlet management
* Asset and verification history
* Mobile field operations

The project contains both a browser-based web application and a lightweight Android mobile application for field users.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │         GitHub          │
                    │   Project Source Code   │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   Backend    │ │ Web Frontend │ │ Mobile App   │
        │   Node.js    │ │ React        │ │ Expo / RN    │
        └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
               │                │                │
               │                └───────┬────────┘
               │                        │
               ▼                        ▼
        ┌─────────────────────────────────────┐
        │          Production API             │
        │             Render                  │
        └──────────────────┬──────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   MongoDB    │
                    │   Database   │
                    └──────────────┘
```

---

# 📂 Repository Structure

```text
Asset Management System/
│
├── Backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── package.json
│
├── Mobile/
│   └── AMS/
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── constants/
│       │   ├── services/
│       │   └── ...
│       ├── assets/
│       ├── app.json
│       ├── eas.json
│       └── package.json
│
└── README.md
```

---

# 🚀 Main Features

## 🔐 Authentication

* User login
* JWT-based authentication
* Secure password handling
* Forgot password
* Password reset
* Change password
* Profile management
* Protected routes
* Session-based authentication state

---

# 👥 User Roles

The system supports the following user roles:

* **SYSTEM_ADMIN**
* **ASO**
* **TSO**
* **TSM**
* **TECHNICIAN**

The system also supports active/inactive user status and role-based access control.

The system is designed with a single System Administrator restriction to prevent unauthorized creation or assignment of additional System Administrator accounts.

---

# 📦 Asset Management

The asset module supports the complete asset lifecycle.

### Asset Operations

* Add assets
* View assets
* Update assets
* Assign assets
* Transfer assets
* Return assets
* Dispose assets
* View asset history
* View asset verification history
* Generate and use asset QR codes

### Asset Lifecycle

```text
Asset Creation
      │
      ▼
Asset Assignment
      │
      ▼
AIN + Serial Number
      │
      ▼
QR Generation
      │
      ▼
QR Scanning
      │
      ▼
Verification Mapping
      │
      ▼
Admin Approval
      │
      ▼
Asset Activated
```

---

# 🔎 Verification Mapping

The verification mapping workflow connects an asset with its assigned outlet.

### Workflow

```text
Asset Created
     ↓
Asset Assigned to Outlet
     ↓
AIN + Serial Number Generated
     ↓
QR Code Generated
     ↓
User Scans QR Code
     ↓
Verification Mapping
     ↓
AIN Entered
     ↓
Assigned Outlet Displayed
     ↓
Verification Submitted
     ↓
System Admin Review
     ├── Approve → Asset Activated
     └── Reject  → Remarks Required → Resubmission
```

The system also maintains verification history.

---

# 🏪 Outlet Management

The system supports outlet registration and asset management.

### Outlet Features

* Outlet search
* Outlet registration
* Region selection
* District selection
* Distributor selection
* Outlet type
* Outlet name
* Address
* Contact person
* Phone number
* Assigned asset viewing
* Existing asset registration
* Verification request submission

### Existing Asset Workflow

```text
Search Outlet
      ↓
Outlet Found?
   ┌──┴──┐
  Yes    No
   │      │
   │      ▼
   │   Create Outlet
   │      │
   └──┬───┘
      ↓
Add Existing Assets
      ↓
Enter Asset Information
      ↓
Submit Verification Request
      ↓
Verification Mapping
```

---

# 📍 Check-In Management

The system supports field check-in operations.

Features include:

* User check-in
* Check-in history
* All check-in history
* Outlet-specific check-in information
* Location-related field workflows

---

# 🌍 Geographic Management

The web system supports management of:

* Regions
* Districts
* Distributors
* Outlets

These entities are connected to the asset and operational workflows.

---

# 🔑 Access Rights

System administrators can configure user feature permissions.

Permission areas include:

* Dashboard
* Users
* Assets
* Asset Operations
* Asset Authorization
* Verification Mapping
* Outlets
* Check-Ins
* Regions
* Districts
* Distributors
* Reports

The permission system is designed around the actual features available in the application rather than unnecessary delete permissions.

---

# 📱 Mobile Application

The project includes a lightweight **Expo React Native Android application** designed primarily for field operations.

### Mobile Navigation

```text
Home
Assets
Operations
Outlet
Requests
Profile
```

The mobile application focuses on field-relevant functionality instead of reproducing every administrative feature of the web application.

---

# 📱 Mobile Technology

The mobile application is built using:

* React Native
* Expo
* Expo Router
* TypeScript
* Expo Secure Store
* Expo Camera
* Expo Location
* React Native components
* EAS Build

---

# 🌐 Web Application

The web application provides the broader administrative and operational interface.

### Web Technologies

* React
* JavaScript / JSX
* CSS
* REST API
* JWT authentication

The web application provides management functionality for administrators and operational users.

---

# ⚙️ Backend

The backend provides the central REST API used by both the web application and mobile application.

### Backend Technologies

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Crypto
* REST API
* Email service integration

---

# 🔗 Production API

The production backend is hosted on Render.

```text
https://igloo-asset-management-system.onrender.com/api
```

The mobile application is configured to communicate with the production backend.

No local backend server is required for the production Android application.

---

# 🗄️ Database

The system uses **MongoDB** as its primary database.

The backend uses **Mongoose** for database modeling and interaction.

Major data areas include:

* Users
* Assets
* Outlets
* Regions
* Districts
* Distributors
* Authorizations
* Verification mappings
* Check-ins
* Asset history

---

# 🔒 Security

The system implements several security mechanisms:

* JWT authentication
* Password hashing with bcrypt
* Protected API routes
* Role-based access control
* Feature-level access rights
* Secure password reset tokens
* Password reset token expiration
* Secure token storage in the mobile application
* Authentication-protected web routes

---

# 🛠️ Local Development

## Backend

Navigate to the backend directory:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create the required environment configuration.

Then start the backend using the project's configured start command.

---

## Frontend

Navigate to the frontend directory:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server using the project's configured command.

---

## Mobile

Navigate to the mobile project:

```bash
cd Mobile/AMS
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

For Android development:

```bash
npx expo start --android
```

---

# 📦 Android Production Build

The Android application is configured for **EAS Build**.

EAS configuration is stored in:

```text
Mobile/AMS/eas.json
```

The application package identifier is:

```text
com.nexora.asset
```

Current application version:

```text
1.0.0
```

The production Android build is generated as an **Android App Bundle (AAB)** for Google Play distribution.

---

# ☁️ Deployment

### Backend

Hosted on:

```text
Render
```

### Web Frontend

Hosted on:

```text
Render
```

### Mobile

Built using:

```text
Expo EAS
```

and prepared for:

```text
Google Play Store
```

---

# 🧪 Testing

The system has been tested across:

### Web

* Authentication
* Protected routes
* Asset workflows
* Outlet workflows
* Verification workflows
* User management
* Access rights
* Check-ins
* Administrative workflows

### Mobile

* Login
* Authentication
* Asset workflows
* Operations
* Outlet workflows
* Existing asset workflow
* Requests
* Profile
* Production API connectivity
* Android real-device testing

The mobile application has also been tested while the local backend server was turned off, confirming that the production application communicates with the deployed backend.

---

# 🔄 Production Architecture

```text
Android Device
      │
      │ HTTPS
      ▼
┌─────────────────────────┐
│      Render Backend     │
│     REST API / Node.js  │
└────────────┬────────────┘
             │
             ▼
        ┌──────────┐
        │ MongoDB  │
        └──────────┘
```

The web application follows the same backend architecture:

```text
Web Browser
      │
      │ HTTPS
      ▼
Render Frontend
      │
      ▼
Render Backend API
      │
      ▼
MongoDB
```

---

# 📌 Project Status

| Component                  | Status     |
| -------------------------- | ---------- |
| Backend                    | ✅ Complete |
| Web Frontend               | ✅ Complete |
| Mobile Application         | ✅ Complete |
| Authentication             | ✅ Complete |
| Asset Management           | ✅ Complete |
| Verification Mapping       | ✅ Complete |
| Outlet Management          | ✅ Complete |
| Check-In                   | ✅ Complete |
| User Management            | ✅ Complete |
| Access Rights              | ✅ Complete |
| Production Backend         | ✅ Deployed |
| Production Web Application | ✅ Deployed |
| Android Production Build   | ✅ Built    |
| GitHub Source Backup       | ✅ Complete |
| Project Archive Backup     | ✅ Complete |

---

# 📁 Backup & Release

The final project source is maintained in GitHub.

The complete project is also archived separately for backup purposes.

The Android production build is maintained through Expo Application Services (EAS).

Recommended backup structure:

```text
GitHub
  └── Complete source code

Google Drive
  └── Complete project archive

Expo EAS
  └── Android production build
```

---

# 👨‍💻 Development

This project was developed as a full-stack asset management solution with separate web and mobile interfaces connected through a centralized REST API.

The architecture allows the web and mobile applications to share the same business logic and production backend while providing interfaces optimized for their respective users and workflows.

---

# 📄 License

This project is intended for authorized organizational and educational/project use.

Unauthorized copying, redistribution, modification, or commercial use should follow the applicable organizational/project agreement.

---

# 📞 Project Information

**Project:** Asset Management System
**Mobile Application:** Nexora / AMS
**Platform:** Web + Android
**Backend:** Node.js / Express
**Frontend:** React
**Mobile:** React Native / Expo
**Database:** MongoDB
**Backend Hosting:** Render
**Mobile Build:** Expo EAS
**Android Package:** `com.nexora.asset`
**Application Version:** `1.0.0`

---

## ⭐ Final Status

**The Igloo Asset Management System is a complete full-stack solution consisting of a production web application, production backend API, and field-focused Android mobile application.**
