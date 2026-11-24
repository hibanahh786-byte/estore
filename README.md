# ESTORE — Full-Stack E-Commerce Web Application

A production-ready, functional, and responsive mini e-commerce web application featuring two distinct roles:
1. **Admin** — Manage categories, products, inventory, image uploads, and customer orders.
2. **Customer / User** — Register, log in, browse products, filter by category, search, place orders with real-time atomic inventory deduction, and review order receipts.

---

## 1. Technology Stack

### Frontend
- **Framework:** React.js with Vite
- **Language:** JavaScript (ES6+)
- **Routing:** React Router DOM (v6)
- **HTTP Client:** Axios with centralized interceptors & token refresh queuing
- **State Management:** React Context API (`AuthContext`, `ToastContext`)
- **Styling:** Tailwind CSS (Modern SaaS aesthetic, violet/indigo primary, slate typography)
- **Icons:** Lucide React

### Backend
- **Framework:** Django 5.x & Django REST Framework (DRF)
- **Language:** Python 3.x
- **Database:** MySQL (Django ORM with PyMySQL) & SQLite local fallback
- **Authentication:** Simple JWT (Access token + Refresh token rotation & blacklisting)
- **Image Processing:** Pillow
- **CORS:** django-cors-headers

---

## 2. Project Directory Structure

```text
ecommerce-project/
│
├── backend/
│   ├── config/
│   │   ├── __init__.py          # PyMySQL installation as MySQLdb
│   │   ├── asgi.py
│   │   ├── settings.py          # JWT, CORS, Database & App configurations
│   │   ├── urls.py              # Root URL router & Media serving
│   │   └── wsgi.py
│   ├── accounts/
│   │   ├── management/
│   │   │   └── commands/
│   │   │       ├── create_admin.py # Safe CLI admin account creation
│   │   │       └── seed_data.py    # Seeds admin, customer, categories, & products
│   │   ├── models.py            # Custom User model (role: admin/user)
│   │   ├── permissions.py       # IsAdminUserRole, IsCustomerRole, IsOwnerOrAdmin
│   │   ├── serializers.py       # Register, Login JWT, User serializers
│   │   ├── tests.py             # Auth & permission unit tests
│   │   ├── urls.py              # /api/auth/*
│   │   └── views.py
│   ├── categories/
│   │   ├── models.py            # Category model
│   │   ├── serializers.py
│   │   ├── urls.py              # /api/categories/*
│   │   └── views.py
│   ├── products/
│   │   ├── models.py            # Product model with image upload & stock
│   │   ├── serializers.py
│   │   ├── tests.py             # Product CRUD & permissions tests
│   │   ├── urls.py              # /api/products/*
│   │   └── views.py
│   ├── orders/
│   │   ├── models.py            # Order and OrderItem (snapshot unit_price)
│   │   ├── serializers.py
│   │   ├── services.py          # Atomic transaction & select_for_update() logic
│   │   ├── tests.py             # Atomic checkout, stock deduction, & anti-tamper tests
│   │   ├── urls.py              # /api/orders/*
│   │   └── views.py
│   ├── media/                   # Uploaded & generated product images
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js         # Centralized Axios with refresh queue
│   │   │   ├── authService.js
│   │   │   ├── categoryService.js
│   │   │   ├── productService.js
│   │   │   └── orderService.js
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── CategoryFilter.jsx
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/
│   │   │   └── useDebounce.js
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   └── CustomerLayout.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminCategories.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminOrders.jsx
│   │   │   │   └── AdminProducts.jsx
│   │   │   └── user/
│   │   │       ├── Home.jsx
│   │   │       ├── MyOrders.jsx
│   │   │       ├── ProductDetails.jsx
│   │   │       └── Products.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   └── .env
│
└── README.md
```

---

## 3. Database Architecture & Business Logic

### Custom User Model (`accounts.User`)
- `id`: Auto primary key
- `username`: Unique CharField (max 150)
- `email`: Unique EmailField
- `password`: Hashed using Django's PBKDF2/argon2
- `role`: Choices `('admin', 'Admin')`, `('user', 'User')`, default `'user'`
- `is_active`, `is_staff`, `date_joined`
- **Security Rule:** Public registration (`POST /api/auth/register/`) forces `role='user'`. Client requests attempting to pass `role='admin'` are ignored. Admin accounts can only be created via management commands or superuser elevation.

### Category Model (`categories.Category`)
- `id`: Primary key
- `name`: Unique CharField (max 100)
- `created_at`, `updated_at`: DateTimeFields

### Product Model (`products.Product`)
- `id`: Primary key
- `name`: CharField (max 255)
- `price`: DecimalField (max 10 digits, 2 decimals; validated > 0)
- `stock_quantity`: PositiveIntegerField (validated >= 0)
- `image`: ImageField (upload_to='products/', validated max 5MB, format check)
- `category`: ForeignKey to `Category` (related_name='products')
- `created_at`, `updated_at`

### Order & OrderItem Models (`orders.Order`, `orders.OrderItem`)
- **Order:**
  - `user`: ForeignKey to `User`
  - `total_amount`: DecimalField (10, 2)
  - `status`: Choices `('placed', 'Completed')`, default `'placed'`
  - `created_at`, `updated_at`
- **OrderItem:**
  - `order`: ForeignKey to `Order` (related_name='items')
  - `product`: ForeignKey to `Product` (on_delete=PROTECT)
  - `quantity`: PositiveIntegerField (validated >= 1)
  - `unit_price`: DecimalField (10, 2) — **Historical Snapshot Price** captured at the exact moment of order placement.

### Atomic Order Placement Business Logic (`backend/orders/services.py`)
1. Retrieves authenticated customer from JWT token.
2. Validates product IDs and positive integer quantities.
3. Opens a database transaction via `transaction.atomic()`.
4. Executes row-level locking via `Product.objects.select_for_update()`.
5. Checks inventory: If `requested_qty > product.stock_quantity`, rolls back transaction and throws 400 Bad Request:
   `{"error": "Insufficient stock for <Product>. Available: X, Requested: Y"}`.
6. Calculates authoritative order total on the server (`total += unit_price * quantity`). Client-supplied totals are discarded.
7. Deducts stock quantity from product inventory.
8. Creates `Order` and `OrderItem` records with snapshot prices.
9. Fully atomic: zero partial deductions or orphaned orders if any product fails.

---

## 4. API Endpoints Reference

Base API URL: `http://localhost:8000/api/`

### Authentication (`/api/auth/`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Public | Register customer account (default role: user) |
| `POST` | `/api/auth/login/` | Public | Login with credentials, returns access & refresh tokens |
| `POST` | `/api/auth/token/refresh/` | Public | Refresh expired JWT access token |
| `GET` | `/api/auth/me/` | Authenticated | Retrieve profile details of authenticated user |

### Categories (`/api/categories/`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories/` | Public / All | List all product categories |
| `POST` | `/api/categories/` | Admin Only | Create a new category |
| `PUT` | `/api/categories/<id>/` | Admin Only | Update existing category |
| `DELETE` | `/api/categories/<id>/` | Admin Only | Delete category |

### Products (`/api/products/`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products/` | Public / All | List products (Supports `?category=`, `?search=`, `?ordering=`) |
| `GET` | `/api/products/<id>/` | Public / All | Retrieve product details |
| `POST` | `/api/products/` | Admin Only | Create product (`multipart/form-data` with image) |
| `PUT` | `/api/products/<id>/` | Admin Only | Update product |
| `PATCH` | `/api/products/<id>/` | Admin Only | Partial product update |
| `DELETE` | `/api/products/<id>/` | Admin Only | Delete product |

### Orders (`/api/orders/`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders/` | Authenticated Customer | Place order atomically (`{"items": [{"product_id": 1, "quantity": 2}]}`) |
| `GET` | `/api/orders/` | Admin Only | List all customer orders with customer & items details |
| `GET` | `/api/orders/my-orders/` | Authenticated Customer | View personal order history |
| `GET` | `/api/orders/<id>/` | Customer / Admin | Retrieve order details (Customer restricted to own orders) |
| `PATCH` | `/api/orders/<id>/status/` | Admin Only | Update order status (`placed` -> `completed`) |

---

## 5. Installation and Setup Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- MySQL Server (or SQLite for local zero-dependency testing)

---

### Step 5.1: Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   SECRET_KEY=your-secure-django-secret-key
   DEBUG=True

   # Choose database engine: 'mysql' or 'sqlite'
   DB_ENGINE=sqlite

   # MySQL settings (used when DB_ENGINE=mysql)
   DB_NAME=ecommerce_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306

   FRONTEND_URL=http://localhost:5173
   ```

   > **Note on MySQL Setup:**
   > If using MySQL:
   > 1. Log in to MySQL CLI: `mysql -u root -p`
   > 2. Create the database: `CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
   > 3. Set `DB_ENGINE=mysql` in `.env`.
   > 
   > If MySQL is not running on your machine, leave `DB_ENGINE=sqlite` for instant zero-config testing!

5. Run database migrations:
   ```bash
   python manage.py makemigrations accounts categories products orders
   python manage.py migrate
   ```

6. Seed sample data & pre-configured accounts:
   Run the included seed command to generate sample categories, products with Pillow-generated images, and test users:
   ```bash
   python manage.py seed_data
   ```

   Or create a custom administrator account manually:
   ```bash
   python manage.py create_admin --username=admin --email=admin@example.com --password=AdminPass123!
   ```

7. Run backend test suite (12 unit tests):
   ```bash
   python manage.py test accounts products orders
   ```

8. Start the Django development server:
   ```bash
   python manage.py runserver 8000
   ```
   API is accessible at `http://localhost:8000/api/`

---

### Step 5.2: Frontend Configuration

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify `.env` configuration:
   Ensure `frontend/.env` contains:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will run at `http://localhost:5173/`

5. (Optional) Build production bundle:
   ```bash
   npm run build
   ```

---

## 6. Pre-Seeded Test Credentials

| Role | Username | Password | Email | Access |
|---|---|---|---|---|
| **Administrator** | `admin` | `AdminPass123!` | `admin@example.com` | Full Admin Dashboard & Storefront |
| **Customer** | `john` | `CustomerPass123!` | `john@example.com` | Customer Storefront & My Orders |

*(You can also click **Register** in the frontend to register any new customer account instantly).*

---

## 7. Acceptance Criteria Verification Checklist

- [x] **1. Customer Registration & Login:** Public registration enforces `user` role; duplicate username/email rejected.
- [x] **2. Admin Login:** Admin logs in and is automatically routed to `/admin` dashboard.
- [x] **3. JWT Flow:** Access token & refresh token rotation with blacklist and automatic 401 request retry.
- [x] **4. Category Management:** Admin can create, edit, search, and delete categories; public can view.
- [x] **5. Product Management:** Admin can create, edit, and delete products with real file uploads (`multipart/form-data`).
- [x] **6. Image Uploads & Serving:** Live preview during upload; correctly served via Django media URL.
- [x] **7. Customer Browsing & Filtering:** Filter by category chips, real-time search, price sorting.
- [x] **8. Atomic Order Placement:** Race-condition-free checkout with `select_for_update()` and server-calculated totals.
- [x] **9. Anti-Tamper Total:** Frontend total parameters are ignored; total is derived strictly from DB prices.
- [x] **10. Insufficient Stock Protection:** Exceeding available stock is rejected atomically with clear error message.
- [x] **11. Customer Privacy:** Customers can only access their own order history; accessing others returns 403 Forbidden.
- [x] **12. Admin Order Fulfillment:** Admin can view all orders, see purchased product snapshots, and mark orders completed.
- [x] **13. Responsive Layout:** Fully mobile-first design with collapsible admin sidebar and responsive drawer.
