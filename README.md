<div align="center">

# 🚀 ProcureHub
### Vendor Procurement Management System

<img src="https://img.shields.io/badge/Flask-Backend-black?style=for-the-badge&logo=flask">
<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react">
<img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql">
<img src="https://img.shields.io/badge/JWT-Authentication-green?style=for-the-badge">
<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge">

*A secure and modern procurement management platform connecting Procurement Managers and Vendors.*

</div>

---

# 📖 About the Project

**ProcureHub** is a web-based Vendor Procurement Management System that streamlines the procurement process by enabling procurement managers to create purchase orders and vendors to submit competitive bids through a secure digital platform.

The system uses **role-based authentication**, **REST APIs**, and **MySQL** to provide a scalable, efficient, and transparent procurement workflow.

---

# ✨ Features

## 👨‍💼 Procurement Manager

- 🔐 Secure Login
- ➕ Create Purchase Orders
- 📋 View Purchase Orders
- 👀 View Vendor Bids
- 🏆 Award Winning Bid
- 📊 Procurement Dashboard

---

## 🏢 Vendor

- 🔐 Secure Login
- 🛒 View Open Purchase Orders
- 💰 Submit Quotations
- 📑 View Submitted Bids
- 📈 Vendor Dashboard

---

# 🛠 Tech Stack

## Frontend

- React.js
- React Router
- Axios
- Font Awesome
- CSS

## Backend

- Flask
- Flask SQLAlchemy
- Flask JWT Extended
- Flask Bcrypt
- Flask CORS

## Database

- MySQL

---

# 📂 Project Structure

```
ProcureHub
│
├── procurehub_backend
│   ├── models
│   ├── routes
│   ├── utils
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   └── .env
│
├── procurehub_frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── services
│   │   └── assets
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# 🔑 API Endpoints

## Authentication

| Method | Endpoint |
|----------|------------------------|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |

---

## Procurement Manager

| Method | Endpoint |
|----------|-----------------------------|
| POST | `/api/v1/procurement/po` |
| GET | `/api/v1/procurement/po` |
| GET | `/api/v1/procurement/bids/<id>` |
| PUT | `/api/v1/procurement/award/<id>` |

---

## Vendor

| Method | Endpoint |
|----------|--------------------------------|
| GET | `/api/v1/vendor/marketplace` |
| POST | `/api/v1/vendor/bids/submit` |
| GET | `/api/v1/vendor/my-bids` |

---

# ⚙️ Installation

## Clone Repository

```bash
git clone <repository-url>
cd ProcureHub
```

---

## Backend Setup

```bash
cd procurehub_backend

pip install -r requirements.txt

python app.py
```

Backend runs on:

```
http://127.0.0.1:5000
```

---

## Frontend Setup

```bash
cd procurehub_frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🗄 Database

Database Used:

- MySQL

Database Name:

```
procurehub
```

---

# 🔐 Authentication

The application uses **JWT (JSON Web Token)** for secure authentication.

- User Registration
- User Login
- Role-Based Authorization
- Protected API Endpoints

---

# 📸 Screenshots

> Add screenshots of your application here.

- Login Page
- Registration Page
- Dashboard
- Marketplace
- Create Purchase Order
- Analytics

---

# 🚀 Future Enhancements

- 📧 Email Notifications
- 📄 PDF Purchase Orders
- 📊 Advanced Analytics
- 🔔 Real-time Notifications
- ☁ Cloud Deployment
- 📱 Mobile Responsive UI

---

# 📄 License

This project is developed for academic purposes.

---

<div align="center">

### ⭐ If you like this project, don't forget to Star the repository ⭐

Made with ❤️ by **MERGE MASTERS**

</div>
