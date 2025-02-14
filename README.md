### **📌 COMP3133 Assignment 1 - Full Stack Development II**
**Author:** Valeria Arce  
**Student ID:** 101462436
**Course:** COMP3133 - Full Stack Development II  
**Professor:** Pritesh Patel
**Date:** February 2025  

---

## **📖 Project Overview**
This project implements a **GraphQL API** using **Node.js, Express, and MongoDB Atlas**.  
It includes:
- **User Authentication** (Signup & Login)
- **Employee Management** (CRUD Operations)
- **MongoDB Atlas Database**
- **GraphQL Endpoint** for interacting with the API

---

## **🚀 How to Run the Project**
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/your-username/101462436_COMP3133_Assignment1.git
cd 101462436_COMP3133_Assignment1
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Set Up Environment Variables**
Create a `.env` file in the **root directory** and add:
```ini
MONGO_URI=mongodb+srv://your-username:yourpassword@cluster0.mongodb.net/comp3133_assignment1?retryWrites=true&w=majority
PORT=5000
```
*(Provided in submission comments)*

### **4️⃣ Start the Server**
```sh
npm start
```
Expected Output:
```
Server running on port 5000
MongoDB Connected
```

---

## **🔗 GraphQL API Endpoint**
Once the server is running, open:  
📌 **GraphQL Playground:**  
```
http://localhost:5000/graphql
```

---

## **📌 Postman Testing**
To test the API, use **Postman** with the following requests.

### **1️⃣ Signup a New User**
#### **Request (POST)**
```json
{
  "query": "mutation { signup(username: \"john_doe\", email: \"john@example.com\", password: \"securepassword\") { id username email } }"
}
```
#### **Expected Response**
```json
{
  "data": {
    "signup": {
      "id": "123456",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

---

### **2️⃣ Login a User**
#### **Request (POST)**
```json
{
  "query": "query { login(email: \"john@example.com\", password: \"securepassword\") { id username email } }"
}
```

---

### **3️⃣ Add an Employee**
#### **Request (POST)**
```json
{
  "query": "mutation { addEmployee(first_name: \"Alice\", last_name: \"Smith\", email: \"alice@example.com\", gender: \"Female\", designation: \"Software Engineer\", salary: 5000, date_of_joining: \"2024-01-15\", department: \"IT\", employee_photo: \"alice.jpg\") { id first_name last_name email designation } }"
}
```

---

### **4️⃣ Get All Employees**
#### **Request (POST)**
```json
{
  "query": "query { getAllEmployees { id first_name last_name email designation } }"
}
```

---

### **5️⃣ Update an Employee**
#### **Request (POST)**
```json
{
  "query": "mutation { updateEmployee(id: \"########\", salary: 6000) { id first_name salary } }"
}
```

---

### **6️⃣ Delete an Employee**
#### **Request (POST)**
```json
{
  "query": "mutation { deleteEmployee(id: \"########\") { id first_name } }"
}
```

---

## **📦 Project Structure**
```
📂 101462436_COMP3133_Assignment1
│── 📂 models
│   ├── Employee.js  # Employee Schema
│   ├── User.js      # User Schema
│
│── 📂 src
│   ├── db.js        # Database Connection
│   ├── index.js     # Server Configuration
│   ├── schema.js    # GraphQL Schema & Resolvers
│
│── .gitignore
│── package.json
│── README.md
```


