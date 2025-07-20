

---

# 🚀 StartSmart

**StartSmart** is a modern job platform designed to connect job seekers with opportunities and help companies find the right talent. It offers users a seamless experience to manage their profiles, browse job listings, apply for positions, and track their applications all in one place.

The platform is built using **Next.js**, **MongoDB**, and **Clerk** for secure authentication and fast performance.

---

## ✨ Features

🔐 **User Authentication and Authorization**  
Secure sign-up, sign-in, and session management powered by Clerk

👤 **User Profile Management**  
Create and update user profiles stored in MongoDB

📄 **Job Listings Management**  
Add, update, and delete job offers through a RESTful API

📥 **Job Applications**  
Apply to jobs and track submitted applications

🔎 **Dynamic Job Search**  
Browse and filter available jobs with ease

🧾 **API Routes**  
Well-structured endpoints for jobs, profiles, and applications

💻 **Responsive UI**  
Built with React (Next.js) for mobile and desktop compatibility

🛠️ **Developer-Friendly Stack**  
TypeScript, Node.js, and REST architecture for scalable development

---

## 🛠️ Getting Started

### Prerequisites

To run the project locally, make sure you have:

- Node.js v16 or later  
- A MongoDB account or local instance  
- A Clerk account for authentication  

### Installation

Clone the repository and install dependencies:

```
git clone https://github.com/AlLubila/startsmart.git
cd startsmart
npm install
```

Create a `.env.local` file in the root directory and add your environment variables:

```
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
```

Start the development server:

```
npm run dev
```

Open your browser and go to [http://localhost:3000](http://localhost:3000)

---

## 📡 API Routes

### Profile

- `GET /api/profile` Fetch the current user's profile  
- `PATCH /api/profile` Update the current user's profile  

### Jobs

- `POST /api/jobs` Create a new job listing  
- `GET /api/jobs` List all available jobs  
- `GET /api/jobs/:id` Get details of a specific job  
- `PATCH /api/jobs/:id` Update a job listing  
- `DELETE /api/jobs/:id` Delete a job listing  

### Applications

- `POST /api/applications` Submit a job application  
- `GET /api/applications` Retrieve user's job applications  

---

## 🧰 Tech Stack

- **Next.js** React framework for server-side rendering  
- **MongoDB** NoSQL database for storing user data  
- **Clerk** Authentication and user management  
- **TypeScript** Type-safe development  
- **Node.js** Backend runtime environment  

---

## 🤝 Contributing

Contributions are welcome. If you would like to help improve the project:

- Follow best practices  
- Write clear and descriptive commit messages  
- Submit issues or pull requests via GitHub  

By contributing, you agree that your submissions become part of the project and may be used by the author in future versions, including commercial releases.

---

## 📄 License

This software is proprietary. You may view and contribute to the codebase via pull requests, but you may not copy, modify, distribute, or use it commercially without explicit permission from the author.

Copyright © 2025 Albi Lubila

---

## 📬 Contact

Created by **Albi Lubila**  
For questions or collaboration, feel free to reach out via GitHub

---

