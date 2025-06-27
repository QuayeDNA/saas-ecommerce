Great — this is a solid foundation. Since you're on a tight one-month deadline, we need to **refine scope, prioritize MVP features, and structure development** in clear phases. Here's a proposed plan, broken into **Requirements**, **MVP Scope**, and **Development Strategy**.

---

## ✅ Refined Functional Requirements

### 1. **Authentication**

* Sign Up & Login (Email/Phone + Password)
* Basic validation & error handling
* JWT-based authentication

### 2. **Dashboard (Overview Page)**

* Greeting (e.g., "Good afternoon, Dave")
* Breadcrumb (e.g., `Home > Dashboard`)
* **Quick Links**: Buttons for MTN, Vodafone, AirtelTigo
* Wallet Balance card
* Transaction Overview (e.g., Total Orders, Amount Spent)
* Last 30 Days Transactions chart (optional if time permits)
* Recent Transactions table

### 3. **Network-Specific Order Pages**

* All networks: Single order input
* **MTN only**:

  * Single input
  * Bulk order via:

    * Text input
    * Excel import

### 4. **History**

* Filterable list of previous orders
* Status (success/failure)
* Date and amount
* Possibly export/download (defer if out of scope)

### 5. **User Profile**

* View profile (name, phone, user type: agent or subscriber)
* Support number
* Logout
* Community group link (optional)

### 6. **AFA Registration Page**

* Inputs: Full Name, Phone Number
* Auto assign:

  * Agent Fee = GH¢3
  * Subscriber Fee = GH¢5.5
* Submit registration

---

## ⚙️ MVP Feature Prioritization (4-Week Plan)

| Week | Focus                  | Features                                                                      |
| ---- | ---------------------- | ----------------------------------------------------------------------------- |
| 1    | **Setup & Core**       | Auth, DB schema, Quick Links UI, Network order forms (single input)           |
| 2    | **MTN Extras**         | Add text input for batch + Excel upload (MTN only), Wallet card, Profile page |
| 3    | **Transactions & AFA** | Transaction history list, Overview dashboard, AFA registration                |
| 4    | **Polish & Launch**    | Error states, UX polish, loading states, responsiveness, basic testing        |

---

## 🛠 Tech Recommendations

### Frontend

* **Vite + React + Tailwind**: Good combo for speed
* **React Router** for navigation
* **Zod/Yup** for validation
* **TanStack Query** (or Axios with SWR) for API management
* **React Hook Form** for all form management

### Backend

* **Express + MongoDB + Mongoose**
* JWT for auth
* Role field in user model (`agent` or `subscriber`)
* Handle Excel upload with [Multer](https://github.com/expressjs/multer) and parse using [SheetJS (xlsx)](https://www.npmjs.com/package/xlsx)

### Excel Upload

* Validate before saving
* Accept only supported columns (e.g., `Phone`, `Amount`)
* Limit number of records per upload (e.g., 50 max)

---

## 📦 Data Models (Initial)

### User

```ts
{
  _id,
  fullName,
  phone,
  email,
  passwordHash,
  userType: 'agent' | 'subscriber',
  walletBalance,
  createdAt
}
```

### Order

```ts
{
  _id,
  userId,
  network: 'MTN' | 'Vodafone' | 'AirtelTigo',
  phone,
  amount,
  status: 'pending' | 'success' | 'failed',
  createdAt
}
```

---

## 🔐 Fault Tolerance Plan

* Use `.env` for config
* Try/catch for backend errors
* Retry logic (on frontend) for critical actions
* Use transactions for multi-step backend ops (if needed)

---

## ✍🏽 Next Steps for You

1. **Confirm MVP features**
2. **Design low-fidelity wireframes** (optional but speeds up dev)
3. **Setup Git repo and base frontend/backend folder structure**
4. **Create dummy data in MongoDB**
5. Start with **Auth** and **Dashboard Quick Links**

---