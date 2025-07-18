# StartSmart

StartSmart is a job platform designed to help users find jobs, manage their profiles, and streamline the hiring process. This project uses Next.js, MongoDB, and Clerk for authentication.

---

## Features

- User authentication and authorization with Clerk  
- User profiles stored and managed in MongoDB  
- REST API routes for profile management  
- Responsive and modern UI with React and Next.js  

---

## Getting Started

Follow these steps to set up and run the project locally:

### Prerequisites

- Node.js (v16 or later recommended)  
- MongoDB account or local MongoDB instance  
- Clerk account for authentication  

### Installation

1. Clone the repository  
```bash
git clone https://github.com/AlLubila/startsmart.git

Go to the project directory

bash
Copy
Edit
cd startsmart
Install dependencies

bash
Copy
Edit
npm install
Create a .env.local file in the root directory and add the following environment variables:

ini
Copy
Edit
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
Run the development server

bash
Copy
Edit
npm run dev
Open your browser and go to http://localhost:3000

API Routes
GET /api/profile — Fetch the current user's profile

PATCH /api/profile — Update the current user's profile

Technologies Used
Next.js (React Framework)

MongoDB (NoSQL Database)

Clerk (Authentication)

TypeScript

Node.js

Contributing
Feel free to submit issues or pull requests. Please follow best practices and write clear commit messages.

License
This project is licensed under the MIT License.

Contact
Created by AlLubila. Feel free to reach out for questions or collaborations.
