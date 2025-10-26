# Lost and Found

A web application designed to help people report and find lost and found items.

## Features

*   **User Authentication:** Secure user registration and login system.
*   **Report Items:** Users can report items they have lost or found, including details like item name, description, location, and an image.
*   **Browse Items:** View a list of all lost and found items.
*   **Search and Filter:** Easily search for specific items and filter by category, location, or date.
*   **Notifications:** Receive notifications for potential matches or when someone wants to contact you about an item.
*   **Contact System:** Securely contact the person who has found your lost item.
*   **Matching Algorithm:** An automated system to match lost items with found items based on their details.

## How it Works

The Lost and Found application provides a centralized platform for managing lost and found items. Here's a typical user flow:

1.  **Register or Log In:** A user creates an account or logs in to an existing account.
2.  **Report an Item:**
    *   If a user has **lost** an item, they can fill out a "Lost Item" form with all the relevant details.
    *   If a user has **found** an item, they can fill out a "Found Item" form.
3.  **Automatic Matching:** When a new lost item is reported, the system automatically searches for potential matches among the found items based on keywords, category, and location.
4.  **Notifications:** If a potential match is found, both the user who lost the item and the user who found the item receive a notification.
5.  **Contact and Verification:** The users can then contact each other through the application to verify the item and arrange for its return.

### Application Flowchart

```
+-------------------+      +-------------------+      +-------------------+
|   User Registers/  |----->|  Reports Lost or  |----->|  System Searches  |
|      Logins       |      |    Found Item     |      |   for Matches     |
+-------------------+      +-------------------+      +-------------------+
        ^                                                     |
        |                                                     v
+-------------------+      +-------------------+      +-------------------+
| User Verifies and |<-----|  Users Communicate  |<-----|  Notifies Users   |
|   Retrieves Item  |      |   to Verify Item  |      |  of Potential Match|
+-------------------+      +-------------------+      +-------------------+
```

## Tech Stack

**Frontend:**

*   React
*   React Router
*   Tailwind CSS
*   Vite

**Backend:**

*   Node.js
*   Express.js
*   MongoDB
*   Mongoose
*   JWT for authentication
*   Cloudinary for image storage

## API Routes

Here is a list of the available API routes:

### User Routes (`/api/users`)

| Method | Endpoint      | Description                  |
| :----- | :------------ | :--------------------------- |
| `POST` | `/register`   | Register a new user.         |
| `POST` | `/login`      | Log in an existing user.     |
| `GET`  | `/me`         | Get the current user's profile.|

### Item Routes (`/api/items`)

| Method | Endpoint      | Description                  |
| :----- | :------------ | :--------------------------- |
| `POST` | `/lost`       | Report a lost item.          |
| `POST` | `/found`      | Report a found item.         |
| `GET`  | `/lost`       | Get all lost items.          |
| `GET`  | `/found`      | Get all found items.         |
| `GET`  | `/lost/my`    | Get the current user's lost items. |
| `GET`  | `/found/my`   | Get the current user's found items. |
| `GET`  | `/lost/:id`   | Get a specific lost item by ID. |
| `GET`  | `/found/:id`  | Get a specific found item by ID. |
| `PUT`  | `/lost/:id`   | Update a specific lost item. |
| `PUT`  | `/found/:id`  | Update a specific found item. |
| `DELETE`| `/lost/:id`   | Delete a specific lost item. |
| `DELETE`| `/found/:id`  | Delete a specific found item. |

### Contact Routes (`/api/contact`)

| Method | Endpoint      | Description                  |
| :----- | :------------ | :--------------------------- |
| `POST` | `/`           | Send an email.               |

### Contact Request Routes (`/api/contact-requests`)

| Method | Endpoint      | Description                  |
| :----- | :------------ | :--------------------------- |
| `POST` | `/`           | Create a contact request.    |
| `GET`  | `/mine`       | Get received contact requests. |
| `GET`  | `/my-requests`| Get sent contact requests.     |
| `POST` | `/:id/approve`| Approve a contact request.   |
| `POST` | `/:id/decline`| Decline a contact request.   |

### Match Routes (`/api/matches`)

| Method | Endpoint          | Description                  |
| :----- | :---------------- | :--------------------------- |
| `GET`  | `/lost/:lostId`   | Get matches for a lost item. |
| `POST` | `/:matchId/verify`| Verify a match.              |
| `GET`  | `/me`             | Get the current user's matches. |
| `POST` | `/:matchId/reject`| Reject a match.              |

### Notification Routes (`/api/notifications`)

| Method | Endpoint      | Description                  |
| :----- | :------------ | :--------------------------- |
| `GET`  | `/`           | Get all notifications for the current user. |
| `PATCH`| `/:id`        | Mark a notification as read. |
| `PATCH`| `/read-all/all`| Mark all notifications as read. |

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js and npm
*   MongoDB (local or a cloud-based instance)
*   A Cloudinary account for image uploads

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/lost-and-found.git
    cd lost-and-found
    ```

2.  **Install backend dependencies:**

    ```bash
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```

### Configuration

1.  **Backend Environment Variables:**

    Create a `.env` file in the `backend` directory and add the following variables:

    ```
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
    ```

2.  **Frontend Environment Variables:**

    Create a `.env` file in the `frontend` directory and add the following variable:

    ```
    VITE_BACKEND_URL=http://localhost:5000
    ```

    *Note: Adjust the `VITE_BACKEND_URL` if your backend is running on a different port.*

## Usage

1.  **Start the backend server:**

    ```bash
    cd backend
    npm start
    ```

    The backend server will start on `http://localhost:5000` (or the port you specified).

2.  **Start the frontend development server:**

    ```bash
    cd ../frontend
    npm run dev
    ```

    The frontend development server will start on `http://localhost:5173` (or the port you specified).

3.  Open your browser and navigate to `http://localhost:5173` to use the application.