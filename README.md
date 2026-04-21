# 🎓 Smart Learning Platform

> 🚀 A modern, role-based educational ecosystem that unifies learning, collaboration, and automation into one powerful platform.

---

## 🌟 Overview

The **Smart Learning Platform** is a full-stack web application designed to enhance the academic experience for:

- 🎓 Students  
- 🧑‍🏫 Academic Panels  
- 🛡️ Administrators  

It combines **resource management**, **gamification**, **AI assistance**, and **real-time collaboration** into a single intuitive system.

---

## ✨ Features

### 🔐 Role-Based Access Control (RBAC)
Dynamic dashboards and secure routing tailored for each user role.

### 📂 Resource Management
- Upload study materials (Academic Panel)
- Approve / reject content (Admin)
- Download & track progress (Students)

### 🏅 Gamified Credit System
- Earn credits automatically  
- Admin rewards for:
  - Hackathons 🧠  
  - Quiz competitions 📝  

### 🤖 AI Community Chatbot
A floating assistant that helps users:
- Navigate the platform
- Find resources
- Solve issues instantly

### 📝 Interactive Quizzes & Tasks
- Instant feedback  
- Performance tracking  
- Task management system  

### 🤝 Live Study Sessions
- Join peer learning sessions  
- Collaborate with tutors  

### 📧 Secure Authentication
- Email OTP verification for safe registration  

---

## 🛠️ Tech Stack

### 🎨 Frontend
- ⚛️ React.js  
- 🎨 Tailwind CSS  
- 🧭 React Router v6  
- 🔔 SweetAlert2  
- 🎯 Heroicons  

### ⚙️ Backend
- ☕ Spring Boot  
- 🔐 Spring Security + BCrypt  
- 🗄️ Hibernate / JPA  
- 📧 JavaMailSender  

---

## 👥 User Roles & Permissions

| Feature | 🎓 Student | 🧑‍🏫 Academic Panel | 🛡️ Admin |
|--------|----------|-------------------|---------|
| Dashboard | ✅ | ✅ | ✅ |
| Quizzes & Tasks | ✅ | ❌ | ❌ |
| AI Chatbot | ✅ | ❌ | ❌ |
| Download Resources | ✅ | ❌ | ❌ |
| Upload Resources | ❌ | ✅ | ❌ |
| Approve Resources | ❌ | ❌ | ✅ |
| Manage Credits | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ✅ |

---

## 🚀 Getting Started

### 📌 Prerequisites
- Node.js (v16+)  
- Java JDK (v17+)  
- Maven  
- MySQL  

---

## ⚙️ Backend Setup
bash:
cd smart-learning-backend

Configure application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_learning_db
spring.datasource.username=root
spring.datasource.password=your_password

spring.mail.username=your_email@example.com
spring.mail.password=your_app_password

Run Backend
mvn spring-boot:run
Backend: http://localhost:8086

⸻

💻 Frontend Setup
cd smart-learning-frontend
npm install

⸻

Environment Configuration
REACT_APP_API_BASE_URL=http://localhost:8086

⸻

Run Frontend
npm start

Frontend: http://localhost:3000

⸻

🤝 Contributing
git checkout -b feature/AmazingFeature
git commit -m "Add AmazingFeature"
git push origin feature/AmazingFeature


⸻


📄 License

MIT License

⸻

⭐ Support

Give this project a ⭐ if you like it!
