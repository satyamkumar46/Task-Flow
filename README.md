# Task-Management-App
TaskFlow is a simple and intuitive task management mobile application built with **React Native**. It helps gig workers organize their daily tasks by allowing them to create, update, delete, and track their work efficiently.

## Features

- 🔐 User Authentication (Login & Sign Up)
- ➕ Create new tasks
- ✏️ Edit existing tasks
- 🗑️ Delete tasks
- ✅ Mark tasks as completed
- 📋 View all tasks
- 💾 Local data storage
- 📱 Clean and responsive UI
- ⚡ Fast and lightweight

## 📸 Screenshots




## 🛠️ Tech Stack

- **React Native**
- **Expo**
- **TypeScript**
- **React Navigation**
- **Firebase Authentication**
- **Firebase Firestore**
- **AsyncStorage** (Local Storage)

## 📂 Project Structure

```
TaskFlow/
│
├── assets/
├── components/
├── config/
├── navigation/
├── screens/
├── services/
|         └── firebase/
├── store/
├── App.tsx
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Task-Flow.git
```

### 2. Navigate to the Project

```bash
cd Task-Flow
```

### 3. Install Dependencies

```bash
npm install
```

or

```bash
yarn
```
### Configure Firebase

1. Create a Firebase project.
2. Enable **Authentication** (Email/Password).
3. Enable **Cloud Firestore**.
4. Add your Firebase configuration to your project.
5. Configure Firestore security rules as needed.

### 4. Start the Development Server

```bash
npx expo start
```

---

## 📱 Running the App

### Android

```bash
npx expo run:android
```

### iOS (macOS)

```bash
npx expo run:ios
```

---

## 📌 Core Functionalities

### Authentication
- User Sign Up
- User Login
- User Logout

### Task Management
- Create a task
- Update task details
- Delete a task
- Mark task as completed
- View all tasks

### Cloud Storage

All tasks are securely stored in **Firebase Cloud Firestore**, allowing users to access and synchronize their tasks across sessions in real time.

---
