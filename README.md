<div align="center">

# 🧊 IGLOO ASSET MANAGEMENT SYSTEM

### Enterprise Full-Stack Web + Mobile Asset Management Platform

**Centralizing Commercial Freezer Assets • Outlets • Field Operations • Verification • Role-Based Workflows**

<br>

![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Backend-20232A?style=for-the-badge&logo=nodedotjs&logoColor=339933)
![Express.js](https://img.shields.io/badge/Express.js-5-20232A?style=for-the-badge&logo=express&logoColor=FFFFFF)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-20232A?style=for-the-badge&logo=mongodb&logoColor=47A248)
![React Native](https://img.shields.io/badge/React_Native-Mobile-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-Mobile-20232A?style=for-the-badge&logo=expo&logoColor=FFFFFF)

<br>

**Developed by Md. Sakib Al-Hasan**  
*Software Development Internship Project — Abdul Monem Ltd (Igloo)*

</div>

---

# 📌 Project Overview

The **Igloo Asset Management System (AMS)** is a full-stack web and mobile software platform developed to support the operational management of commercial freezer assets.

The system centralizes **assets, outlets, organizational users, field operations, verification processes, approval workflows, asset movements, repairs, and access control** through a shared backend architecture.

The platform consists of:

- 🌐 A **React-based web application** for administrative and operational workflows
- ⚙️ A **Node.js + Express.js REST API** containing shared business logic
- 🗄️ A **MongoDB + Mongoose database layer**
- 📱 A **React Native + Expo Android application** focused on field operations

Both web and mobile applications communicate with the same backend and database, allowing business rules and operational data to remain consistent across platforms.

---

# 🎯 Project Objective

Commercial freezer asset operations involve multiple organizational roles, field personnel, outlets, verification stages, and asset lifecycle activities.

The system was designed to provide a centralized digital workflow for:

- Managing commercial freezer assets
- Associating assets with outlets
- Identifying assets through structured AIN and QR-based workflows
- Coordinating field and administrative operations
- Managing verification requests and approvals
- Maintaining asset history and traceability
- Controlling access according to organizational responsibilities
- Providing field-focused functionality through an Android application

The goal was to transform operational requirements into a structured, secure, and maintainable software platform.

---

# ✨ Project Highlights

```text
🌐 Full-Stack Web Application
⚙️ REST API Backend
🗄️ Centralized MongoDB Database
📱 Field-Focused Android Application
🔐 JWT Authentication
👥 Role-Based Authorization
🛡️ Granular Access Rights
📦 Asset Lifecycle Management
🏪 Outlet Management
🆔 Asset Identification Number (AIN)
📱 QR / Barcode-Based Identification
✅ Verification & Approval Workflows
🔄 Rejection & Resubmission Workflows
📍 GPS-Supported Field Check-Ins
🛠️ Repair Operations
🚚 Asset Transfer & Return
📜 Operational History & Traceability
```

---

# ⚙️ Project Stack

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-0D1117?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![TypeScript](https://img.shields.io/badge/TypeScript-0D1117?style=for-the-badge&logo=typescript&logoColor=3178C6)
![React](https://img.shields.io/badge/React-0D1117?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-0D1117?style=for-the-badge&logo=vite&logoColor=646CFF)
![Node.js](https://img.shields.io/badge/Node.js-0D1117?style=for-the-badge&logo=nodedotjs&logoColor=339933)
![Express.js](https://img.shields.io/badge/Express.js-0D1117?style=for-the-badge&logo=express&logoColor=FFFFFF)
![MongoDB](https://img.shields.io/badge/MongoDB-0D1117?style=for-the-badge&logo=mongodb&logoColor=47A248)
![Mongoose](https://img.shields.io/badge/Mongoose-0D1117?style=for-the-badge&logo=mongoose&logoColor=880000)
![React Native](https://img.shields.io/badge/React_Native-0D1117?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-0D1117?style=for-the-badge&logo=expo&logoColor=FFFFFF)
![Git](https://img.shields.io/badge/Git-0D1117?style=for-the-badge&logo=git&logoColor=F05032)
![Postman](https://img.shields.io/badge/Postman-0D1117?style=for-the-badge&logo=postman&logoColor=FF6C37)

</div>

---

# 🏗️ System Architecture

```text
                  ┌──────────────────────────┐
                  │      USERS / CLIENTS     │
                  └────────────┬─────────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌───────────────────┐       ┌───────────────────┐
       │   React Web App   │       │ React Native App  │
       │   React + Vite    │       │      + Expo       │
       └─────────┬─────────┘       └─────────┬─────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               │
                               │ REST API
                               ▼
                 ┌───────────────────────────┐
                 │     Node.js + Express     │
                 │                           │
                 │  Authentication           │
                 │  Authorization            │
                 │  Validation               │
                 │  Business Logic           │
                 │  API Controllers          │
                 └─────────────┬─────────────┘
                               │
                               ▼
                 ┌───────────────────────────┐
                 │    MongoDB + Mongoose     │
                 │                           │
                 │ Assets                    │
                 │ Users                     │
                 │ Outlets                   │
                 │ Verification              │
                 │ Operational Records       │
                 └───────────────────────────┘
```

### Architecture Principle

> **One backend • One centralized database • Multiple client applications • Consistent business logic**

The React web application and React Native mobile application consume the same REST API, reducing duplicated business logic and maintaining consistent operational data.

---

# 🛠️ Tech Stack

## 💻 Languages

![JavaScript](https://img.shields.io/badge/JavaScript-0D1117?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![TypeScript](https://img.shields.io/badge/TypeScript-0D1117?style=for-the-badge&logo=typescript&logoColor=3178C6)
![HTML5](https://img.shields.io/badge/HTML5-0D1117?style=for-the-badge&logo=html5&logoColor=E34F26)
![CSS3](https://img.shields.io/badge/CSS3-0D1117?style=for-the-badge&logo=css3&logoColor=1572B6)

---

## 🎨 Frontend Development

![React](https://img.shields.io/badge/React-0D1117?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-0D1117?style=for-the-badge&logo=vite&logoColor=646CFF)
![React Router](https://img.shields.io/badge/React_Router-0D1117?style=for-the-badge&logo=reactrouter&logoColor=CA4245)
![Axios](https://img.shields.io/badge/Axios-0D1117?style=for-the-badge&logo=axios&logoColor=5A29E4)

**Frontend responsibilities include:**

- User interfaces
- Navigation and protected routes
- Dashboard workflows
- Asset operations
- Outlet management
- Verification interfaces
- User and permission management
- API integration
- Form validation and error handling
- Responsive application interfaces

---

## ⚙️ Backend & API Development

![Node.js](https://img.shields.io/badge/Node.js-0D1117?style=for-the-badge&logo=nodedotjs&logoColor=339933)
![Express.js](https://img.shields.io/badge/Express.js-0D1117?style=for-the-badge&logo=express&logoColor=FFFFFF)
![REST API](https://img.shields.io/badge/REST_API-0D1117?style=for-the-badge&logo=fastapi&logoColor=009688)
![JWT](https://img.shields.io/badge/JWT-0D1117?style=for-the-badge&logo=jsonwebtokens&logoColor=FFFFFF)

**Backend responsibilities include:**

- REST API endpoints
- Authentication
- Authorization
- Access-right validation
- Business rules
- Data validation
- Database operations
- Asset workflows
- Verification workflows
- User management
- Error handling
- Client-server communication

---

## 🗄️ Database

![MongoDB](https://img.shields.io/badge/MongoDB-0D1117?style=for-the-badge&logo=mongodb&logoColor=47A248)
![Mongoose](https://img.shields.io/badge/Mongoose-0D1117?style=for-the-badge&logo=mongoose&logoColor=880000)

MongoDB provides centralized persistence for operational data, while Mongoose is used for schema modeling and application-level database operations.

Major data domains include:

```text
Assets
Users
Outlets
Regions
Districts
Distributors
Manufacturers
Verification Records
Verification Mappings
Asset Requests
Check-In Records
Operational History
```

---

## 📱 Mobile Development

![React Native](https://img.shields.io/badge/React_Native-0D1117?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-0D1117?style=for-the-badge&logo=expo&logoColor=FFFFFF)
![TypeScript](https://img.shields.io/badge/TypeScript-0D1117?style=for-the-badge&logo=typescript&logoColor=3178C6)

The Android application was designed as a **lightweight field-focused client** rather than a duplicate of every administrative web feature.

Mobile capabilities include:

- Secure authentication
- Field dashboard
- Asset search
- Asset operations
- QR / barcode scanning
- Verification workflows
- Verification history
- Asset requests
- Repair workflows
- Outlet registration
- Existing asset onboarding
- GPS-supported check-ins
- Profile functionality
- Secure token storage
- Shared REST API integration

---

## 🔧 Development Tools

![Git](https://img.shields.io/badge/Git-0D1117?style=for-the-badge&logo=git&logoColor=F05032)
![GitHub](https://img.shields.io/badge/GitHub-0D1117?style=for-the-badge&logo=github&logoColor=FFFFFF)
![Postman](https://img.shields.io/badge/Postman-0D1117?style=for-the-badge&logo=postman&logoColor=FF6C37)
![VS Code](https://img.shields.io/badge/VS_Code-0D1117?style=for-the-badge&logo=visualstudiocode&logoColor=007ACC)

Used for:

- Source control
- Repository management
- API testing
- Debugging
- Development
- Release management
- Production deployment workflow

---

# ✨ Core Features

## 📦 Asset Management

The platform supports structured management of commercial freezer assets throughout their operational lifecycle.

- Asset registration
- Asset identification
- AIN management
- Serial number association
- Manufacturer information
- Capacity information
- Manufacturing information
- Outlet assignment
- Asset search
- Asset status management
- Asset history
- Asset movement tracking

---

## 🏪 Outlet Management

Outlet workflows allow operational users to manage locations associated with freezer assets.

- Outlet registration
- Existing outlet search
- Region association
- District association
- Distributor association
- Outlet type
- Outlet contact information
- Existing asset association
- Asset assignment

---

## ✅ Asset Verification

Verification is one of the major operational workflows of the system.

```text
Asset / Outlet Information
          │
          ▼
Verification Request
          │
          ▼
Verification Mapping
          │
          ▼
Asset Identification
          │
          ▼
Administrative Review
       ┌──┴──┐
       │     │
       ▼     ▼
    APPROVE REJECT
       │     │
       │     ▼
       │   Remarks
       │     │
       │     ▼
       │  Correction
       │     │
       │     ▼
       │ Resubmission
       │     │
       └─────┴──────────► Final Verification
```

The workflow supports:

- New verification requests
- Existing verification requests
- Verification mapping
- AIN-based identification
- Outlet association
- Administrative review
- Approval
- Rejection with remarks
- Correction
- Resubmission
- Verification history

---

## 🔄 Asset Operations

```text
Assignment
   ↓
Transfer
   ↓
Return
   ↓
Repair
   ↓
Disposal / Lifecycle History
```

These processes help maintain asset traceability across operational changes.

---

## 📍 Field Operations

- GPS-supported check-ins
- Outlet-level operations
- Asset lookup
- QR / barcode scanning
- Verification
- Asset requests
- Repair workflows
- Mobile field activities

---

## 👥 User & Access Management

- User creation and management
- User status management
- Authentication
- Role-based authorization
- Access-right management
- Profile management
- Password management
- Password recovery
- Inactive account handling

---

# 👥 User Roles

| Role | Operational Purpose |
|---|---|
| **SYSTEM_ADMIN** | Central administration, approvals, users, permissions and system-level operations |
| **ASO** | Assigned asset and operational workflows |
| **TSO** | Territory-oriented asset and field operations |
| **TSM** | Management and assigned operational workflows |
| **TECHNICIAN** | Technical and field-focused asset operations |

Access to features is controlled according to assigned roles and permissions.

---

# 🔐 Authentication & Security

Security was incorporated into the application architecture rather than treated as a purely UI-level restriction.

### Authentication

```text
User Credentials
      │
      ▼
Authentication Request
      │
      ▼
Backend Validation
      │
      ▼
JWT Generation
      │
      ▼
Authenticated Session
      │
      ▼
Protected API Requests
```

### Security Features

- 🔑 JWT-based authentication
- 🔒 Password hashing
- 🛡️ Protected API routes
- 👥 Role-based authorization
- 🎛️ Granular access rights
- ✅ Request and data validation
- 🚫 Inactive-account handling
- 🔁 Password recovery workflow
- 🌐 Controlled CORS configuration
- 📱 Secure mobile token storage

> Authorization is enforced through backend application logic rather than relying solely on frontend visibility.

---

# 🌐 Web Application

The web application provides the broader administrative and operational interface of the platform.

```text
Dashboard
Assets
Verification
Verification Mapping
Verification History
Asset Requests
Asset Operations
Check-Ins
Regions
Districts
Distributors
Outlets
Users
Access Rights
Profile
Authentication
```

The web client communicates with the backend through REST APIs and provides interfaces based on the authenticated user's assigned permissions.

---

# 📱 Android Mobile Application

The mobile application extends the system to field users through a focused Android experience.

### Mobile Navigation

```text
Home
  │
  ├── Assets
  ├── Operations
  ├── Outlet
  ├── Requests
  └── Profile
```

### Mobile Capabilities

```text
Authentication
Asset Search
QR / Barcode Scanning
Verification
Verification History
New Asset Requests
Asset Operations
Repair Workflows
Outlet Registration
Existing Asset Onboarding
GPS Check-Ins
Profile Management
```

The mobile application uses the **same backend API and database** as the web application.

---

# 🔄 Major Workflows

## 🆕 New Asset Workflow

```text
Asset Creation
      ↓
Outlet Assignment
      ↓
AIN + Serial Number
      ↓
QR Identification
      ↓
Verification Mapping
      ↓
Verification Request
      ↓
Administrative Review
      ↓
Approval / Rejection
      ↓
Final Status
```

## 📦 Existing Asset Workflow

```text
Search / Register Outlet
          ↓
Add Existing Asset
          ↓
Manufacturer + Capacity
          ↓
Manufacturing Information
          ↓
Verification Request
          ↓
Administrative Review
          ↓
Approval / Rejection
```

## ❌ Rejection & Resubmission

```text
Verification Submitted
         ↓
Administrative Review
         ↓
      Rejected
         ↓
   Remarks Provided
         ↓
Information Corrected
         ↓
     Resubmitted
         ↓
Administrative Review
         ↓
       Approved
```

---

# 🔗 REST API Architecture

The backend exposes RESTful endpoints consumed by both the web and mobile clients.

```text
React Web Client ───────┐
                        │
                        ▼
                 REST API Layer
                        │
                        ▼
               Express Application
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
       Authentication  Logic    Validation
             │          │          │
             └──────────┼──────────┘
                        ▼
                    Mongoose
                        │
                        ▼
                     MongoDB
                        ▲
                        │
React Native Client ────┘
```

This architecture allows the clients to share backend business rules instead of implementing independent data logic.

---

# 🗄️ Data Organization

```text
Organization
├── Regions
├── Districts
├── Distributors
└── Outlets

Assets
├── Identification
├── Manufacturer
├── Capacity
├── Assignment
├── Status
└── History

Users
├── Account
├── Role
├── Status
└── Access Rights

Operations
├── Verification
├── Verification Mapping
├── Requests
├── Transfers
├── Returns
├── Repairs
└── Check-Ins
```

---

# 🧪 Testing & Validation

The application was validated primarily through **manual functional and integration testing**.

Testing focused on:

- Authentication
- Authorization
- Protected routes
- Role-based functionality
- REST API responses
- Form validation
- Asset operations
- Outlet workflows
- Verification workflows
- Rejection and resubmission
- Database operations
- Web-to-backend integration
- Mobile-to-backend integration
- QR / barcode workflows
- Field check-ins
- Error handling

**Postman** was used for API testing and debugging.

> The project does not claim an automated unit/integration test suite; validation was performed through functional and integration-oriented manual testing.

---

# 🚀 Deployment

The system is deployed as a live web application using **Render**.

### Production Architecture

```text
                    INTERNET
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
  React Web Frontend         Android Application
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
               Production REST API
                       │
                       ▼
               Node.js / Express
                       │
                       ▼
                     MongoDB
```

### Live Web Application

[![Live Application](https://img.shields.io/badge/Live_Application-Open_Web_App-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://igloo-asset-management-frontend.onrender.com)

### Production API

[![Backend API](https://img.shields.io/badge/Backend_API-Production-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://igloo-asset-management-system.onrender.com)

> Production credentials, database connection strings, JWT secrets, email-service credentials, and other environment-specific secrets are intentionally excluded from this documentation.

---

# 📸 Application Screenshots

> A visual walkthrough of the Igloo Asset Management System across its web and Android applications.

---

## 🌐 Web Application

The web application provides centralized access to asset management, outlet operations, verification workflows, authorization, user management, and administrative functionality.

### 🖥️ Web Interface Gallery

<table>
<tr>
<td width="50%" align="center">
<strong>01 — Dashboard</strong><br><br>
<img src="docs/screenshots/web/01-dashboard.jpg" width="100%" alt="Web Dashboard">
</td>
<td width="50%" align="center">
<strong>02 — Assets</strong><br><br>
<img src="docs/screenshots/web/02-assets.jpg" width="100%" alt="Web Assets">
</td>
</tr>

<tr>
<td width="50%" align="center">
<strong>03 — Asset Details</strong><br><br>
<img src="docs/screenshots/web/03-asset-details.jpg" width="100%" alt="Asset Details">
</td>
<td width="50%" align="center">
<strong>04 — Asset QR</strong><br><br>
<img src="docs/screenshots/web/04-asset-qr.jpg" width="100%" alt="Asset QR">
</td>
</tr>

<tr>
<td width="50%" align="center">
<strong>05 — Add New Asset</strong><br><br>
<img src="docs/screenshots/web/05-add-new-asset.jpg" width="100%" alt="Add New Asset">
</td>
<td width="50%" align="center">
<strong>06 — Outlets</strong><br><br>
<img src="docs/screenshots/web/06-outlets.jpg" width="100%" alt="Outlets">
</td>
</tr>

<tr>
<td width="50%" align="center">
<strong>07 — Outlet Details & Assets</strong><br><br>
<img src="docs/screenshots/web/07-outlet-details-assets.jpg" width="100%" alt="Outlet Details and Assets">
</td>
<td width="50%" align="center">
<strong>08 — Create Outlet</strong><br><br>
<img src="docs/screenshots/web/08-create-outlet.jpg" width="100%" alt="Create Outlet">
</td>
</tr>

<tr>
<td width="50%" align="center">
<strong>09 — Add Existing Asset</strong><br><br>
<img src="docs/screenshots/web/09-add-existing-asset.jpg" width="100%" alt="Add Existing Asset">
</td>
<td width="50%" align="center">
<strong>10 — Asset Authorization</strong><br><br>
<img src="docs/screenshots/web/10-asset-authorization.jpg" width="100%" alt="Asset Authorization">
</td>
</tr>

<tr>
<td width="50%" align="center">
<strong>11 — Verification Request</strong><br><br>
<img src="docs/screenshots/web/11-verification-request.jpg" width="100%" alt="Verification Request">
</td>
<td width="50%" align="center">
<strong>12 — Verification</strong><br><br>
<img src="docs/screenshots/web/12-verification.jpg" width="100%" alt="Verification">
</td>
</tr>

<tr>
<td width="50%" align="center">
<strong>13 — User Management</strong><br><br>
<img src="docs/screenshots/web/13-user-management.jpg" width="100%" alt="User Management">
</td>
<td width="50%" align="center">
<strong>14 — Role-Based Access Rights</strong><br><br>
<img src="docs/screenshots/web/14-role-based-access-rights.jpg" width="100%" alt="Role Based Access Rights">
</td>
</tr>

<tr>
<td width="50%" align="center">
<strong>15 — Profile</strong><br><br>
<img src="docs/screenshots/web/15-profile.jpg" width="100%" alt="Web Profile">
</td>
<td width="50%" align="center">
<strong>🌐 Web Platform</strong><br><br>
Centralized administrative and operational experience integrated with the shared REST API and database.
</td>
</tr>
</table>

---

## 📱 Android Mobile Application

The Android application provides a lightweight, field-focused experience while communicating with the same production backend used by the web platform.

### 📲 Mobile Interface Gallery

<table>

<tr>
<td width="25%" align="center">
<strong>01 — Dashboard</strong><br><br>
<img src="docs/screenshots/mobile/01-dashboard.jpg" width="100%" alt="Mobile Dashboard">
</td>
<td width="25%" align="center">
<strong>02 — Assets</strong><br><br>
<img src="docs/screenshots/mobile/02-assets.jpg" width="100%" alt="Mobile Assets">
</td>
<td width="25%" align="center">
<strong>03 — All Assets</strong><br><br>
<img src="docs/screenshots/mobile/03-all-assets.jpg" width="100%" alt="Mobile All Assets">
</td>
<td width="25%" align="center">
<strong>04 — Asset Details</strong><br><br>
<img src="docs/screenshots/mobile/04-asset-details.jpg" width="100%" alt="Mobile Asset Details">
</td>
</tr>

<tr>
<td width="25%" align="center">
<strong>05 — Add New Asset</strong><br><br>
<img src="docs/screenshots/mobile/05-add-new-asset.jpg" width="100%" alt="Mobile Add New Asset">
</td>
<td width="25%" align="center">
<strong>06 — Asset Operations</strong><br><br>
<img src="docs/screenshots/mobile/06-asset-operations.jpg" width="100%" alt="Mobile Asset Operations">
</td>
<td width="25%" align="center">
<strong>07 — Outlets</strong><br><br>
<img src="docs/screenshots/mobile/07-outlets.jpg" width="100%" alt="Mobile Outlets">
</td>
<td width="25%" align="center">
<strong>08 — Add New Outlet</strong><br><br>
<img src="docs/screenshots/mobile/08-add-new-outlet.jpg" width="100%" alt="Mobile Add New Outlet">
</td>
</tr>

<tr>
<td width="25%" align="center">
<strong>09 — Outlet Details</strong><br><br>
<img src="docs/screenshots/mobile/09-outlet-details.jpg" width="100%" alt="Mobile Outlet Details">
</td>
<td width="25%" align="center">
<strong>10 — Existing Asset</strong><br><br>
<img src="docs/screenshots/mobile/10-add-existing-asset.jpg" width="100%" alt="Mobile Add Existing Asset">
</td>
<td width="25%" align="center">
<strong>11 — Repair Request</strong><br><br>
<img src="docs/screenshots/mobile/11-repair-request.jpg" width="100%" alt="Mobile Repair Request">
</td>
<td width="25%" align="center">
<strong>12 — QR Scanner</strong><br><br>
<img src="docs/screenshots/mobile/12-qr-scanner.jpg" width="100%" alt="Mobile QR Scanner">
</td>
</tr>

<tr>
<td width="25%" align="center">
<strong>13 — Verification Request</strong><br><br>
<img src="docs/screenshots/mobile/13-verification-request.jpg" width="100%" alt="Mobile Verification Request">
</td>
<td width="25%" align="center">
<strong>14 — Requests</strong><br><br>
<img src="docs/screenshots/mobile/14-requests.jpg" width="100%" alt="Mobile Requests">
</td>
<td width="25%" align="center">
<strong>15 — Verification</strong><br><br>
<img src="docs/screenshots/mobile/15-verification.jpg" width="100%" alt="Mobile Verification">
</td>
<td width="25%" align="center">
<strong>16 — Profile</strong><br><br>
<img src="docs/screenshots/mobile/16-profile.jpg" width="100%" alt="Mobile Profile">
</td>
</tr>

</table>

---

## 🔗 One Platform — Two Experiences

```text
                IGLOO ASSET MANAGEMENT SYSTEM
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      🌐 WEB APPLICATION            📱 MOBILE APPLICATION
             │                             │
      Administration                 Field Operations
      Asset Management               Asset Access
      User Management                QR Scanning
      Access Control                 Verification
      Verification                   Outlet Operations
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
                    ⚙️ SHARED REST API
                            │
                            ▼
                   🗄️ CENTRAL DATABASE
```

> The web and Android applications provide different user experiences while sharing the same backend architecture, business rules, and operational data.

---

# 📚 Engineering Experience

Building the Igloo Asset Management System provided hands-on experience across the software development lifecycle.

```text
Requirements Analysis
        ↓
Application Planning
        ↓
Frontend Development
        ↓
Backend Development
        ↓
Database Modeling
        ↓
REST API Development
        ↓
Authentication & Authorization
        ↓
Web + Mobile Integration
        ↓
Validation & Error Handling
        ↓
Testing & Debugging
        ↓
Production Deployment
        ↓
Android Application Delivery
```

### Key Engineering Areas

- Full-stack application development
- Backend development
- REST API design and integration
- Database modeling
- Authentication
- Authorization
- Role-based workflows
- Access-right management
- React application development
- React Native mobile development
- Web/mobile shared API architecture
- Validation
- Error handling
- Debugging
- Functional testing
- Production deployment
- Git-based source control

---

# 📁 Project Structure

```text
Igloo-Asset-Management-System/
│
├── backend/
│   └── Node.js + Express.js REST API
│
├── frontend/
│   └── React + Vite Web Application
│
├── Mobile/
│   └── AMS/
│       └── React Native + Expo Android Application
│
├── docs/
│   └── screenshots/
│       ├── web/
│       │   └── 15 Web Application Screenshots
│       │
│       └── mobile/
│           └── 16 Android Application Screenshots
│
└── README.md
```

This structure keeps the web client, backend services, mobile application, and portfolio documentation logically separated while allowing the application components to operate as one integrated system.

---

# 🔒 Security & Repository Notice

This repository represents software development work completed as part of a professional internship project.

For security and privacy:

- Production environment variables are not documented
- Database credentials must remain private
- JWT secrets must remain private
- API/service credentials must remain private
- Private organizational data should not be included in screenshots
- User credentials should never be committed
- Confidential internship documentation should not be published through this repository

---

# 👨‍💻 Developer

<div align="center">

## Md. Sakib Al-Hasan

### Software Developer | Full-Stack Developer | Backend Developer

**B.Sc. in Computer Science & Engineering**

<br>

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Let's_Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/r-talukder66/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow_Me-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sakib-rone66)
[![Email](https://img.shields.io/badge/Email-Contact_Me-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:info.sakib.bluesec@gmail.com)

</div>

---

# ⚠️ Project Notice

The **Igloo Asset Management System** was developed as part of a **Software Development Internship project at Abdul Monem Ltd (Igloo)**.

This repository and its public documentation are intended to demonstrate the software engineering work, architecture, technologies, and development experience associated with the project.

Sensitive business information, production secrets, credentials, private operational data, and confidential organizational documentation are intentionally excluded.

---

<div align="center">

# 💻 Build • Solve • Learn • Improve

### From Real Operational Requirements to a Working Web + Mobile Software Platform

**Designed • Developed • Integrated • Tested • Deployed**

<br>

⭐ **Thanks for exploring the Igloo Asset Management System**

</div>
