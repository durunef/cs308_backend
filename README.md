# E-commerce Backend

This project constitutes the backend (server) side of a comprehensive e-commerce platform. It manages core e-commerce functionalities such as user management, product and category management, reviews, orders, and invoicing. It provides specific capabilities for different user types through role-based access control, including Product Manager.

## Technologies

*   **Node.js:** Runtime environment for executing JavaScript on the server.
*   **Express.js:** A fast and flexible Node.js framework for building web applications and APIs.
*   **MongoDB:** A NoSQL database.
*   **Mongoose:** An Object Data Modeling (ODM) library for MongoDB.
*   **JWT (JSON Web Tokens):** Used for user authentication and authorization.
*   **Multer:** Middleware for handling `multipart/form-data`, primarily used for uploading files (like product images).
*   **Nodemailer:** Library for sending emails (e.g., order invoices).
*   **pdfkit:** For generating PDF invoices.
*   **bcryptjs:** For hashing passwords.
*   **dotenv:** For loading environment variables from a `.env` file.
*   **catchAsync, AppError (Utils):** Helper functions for simplified error handling.

## Features

The backend provides the following key features:

*   **User Management:**
    *   User registration (Signup) and login.
    *   Role assignment based on email domain (user, product-manager, admin, delivery).
    *   Viewing user profiles.
*   **Role-Based Access Control:**
    *   `protect` middleware for routes accessible only by authenticated users.
    *   `restrictTo` middleware for routes accessible by specific user roles.
    *   Specific routes and permissions for the Product Manager role (`/api/v1/product-manager`).
*   **Product Management (Product Manager):**
    *   Listing, searching, and sorting products.
    *   Adding new products (including image upload).
    *   Updating existing products.
    *   Deleting products.
    *   Updating product stock quantity.
*   **Category Management (Product Manager):**
    *   Listing all categories.
    *   Adding new categories.
    *   Updating existing categories.
    *   Deleting categories.
*   **Review Management (Product Manager):**
    *   Viewing product reviews.
    *   Approving or rejecting reviews.
    *   Listing pending reviews for approval.
*   **Order and Invoice Management:**
    *   Users converting their carts into orders.
    *   Automatic PDF invoice generation upon order creation and sending via email.
    *   Listing all orders/invoices for the product manager.
*   **Delivery Information (Product Manager):**
    *   Listing orders that are in transit or have been delivered.
    *   Updating the status of an order (typically for admin or delivery roles).
*   **Middleware:** Custom middleware for authentication, authorization, error handling, etc.

## Setup

Follow these steps to get the project running on your local machine.

### Prerequisites

*   Node.js installed (v14 or higher recommended).
*   npm or yarn installed.
*   MongoDB server running (locally or cloud-hosted).

### Installation Steps

1.  Clone the repository:
    ```bash
    git clone <Your Repository URL>
    ```
2.  Navigate to the backend directory:
    ```bash
    cd <cloned_repo_name>/cs308_backend
    ```
3.  Install the required npm packages:
    ```bash
    npm install
    ```
    or if you are using yarn:
    ```bash
    yarn install
    ```
4.  Configure the `.env` file. Create a `.env` file in the root directory of the backend project and fill in the following variables:

    ```dotenv
    NODE_ENV=development
    PORT=3000 # Port for the backend server
    MONGO_URI=mongodb://localhost:27017/your_database_name # Your MongoDB connection string
    JWT_SECRET=yourhighlysecretskeyhere # A random string for JWT
    JWT_COOKIE_EXPIRES_IN=1 # JWT cookie expiration in days

    # For Email Sending (Invoice, etc.)
    SMTP_HOST=your_smtp_server.com
    SMTP_PORT=587 # Or your SMTP provider's port
    SMTP_USER=your_email@example.com # Your email account
    SMTP_PASS=your_email_password # Your email password
    EMAIL_FROM=My Shop <your_email@example.com> # Sender email format
    ```
    > Replace `your_database_name`, `yourhighlysecretskeyhere`, and email settings with your actual information.

5.  (Optional) If you have a seed script to populate the database with initial data (like categories, products), run it. You might have files like `seedProducts.js`:
    ```bash
    # If you have a seed script
    node seedProducts.js
    ```

## Running the Application

To start the backend server:

```bash
npm start
# or for development mode (if you have nodemon configured):
npm run dev
```

The server will start running on the port specified in your `.env` file (default: 3000).

## API Endpoints

The API endpoints are generally prefixed with `/api/v1/`. The main endpoint groups include:

*   `/api/v1/auth`: User registration and login.
*   `/api/v1/users`: User related operations.
*   `/api/products`: Listing products, viewing details, (adding/deleting/updating for admin/product manager).
*   `/api/categories`: Listing categories, (adding/deleting/updating for product manager).
*   `/api/v1/reviews`: Review operations (adding review to a product, approving/rejecting reviews).
*   `/api/v1/product-manager`: Endpoints specifically for Product Manager role covering product, category, review, order/invoice, and delivery management.
*   `/api/orders`: Placing orders, order history.
*   `/invoices`: Accessing static invoice PDF files (`/invoices/invoice-ORDERID.pdf`).

For detailed endpoint information, please refer to the Postman Collection file or any available API documentation.

## Testing

You can use tools like Postman to test the API endpoints. To test role-based access control, you should log in with users of different roles and send requests to the relevant endpoints.

*   Log in as a Product Manager (a user registered with a `@product.com` email).
*   Use the obtained token in the `Authorization: Bearer TOKEN_HERE` header.

## Project Structure

The basic folder structure of the backend project is as follows:
