# Wanderlust 🌍

Wanderlust is a full-stack vacation rental marketplace web application inspired by Airbnb. It allows travelers to explore unique accommodations across the world and empowers property owners to list and manage their stays.

---

## ✨ Features

- **Explore Listings**: Browse diverse stays with photos, pricing, and category filters (Trending, Iconic Cities, Mountains, Castles, Camping, Pools, and more).
- **Tax Calculation Toggle**: Real-time switch to preview total prices including 18% GST.
- **Property Management (Full CRUD)**: Registered hosts can create new listings, upload property photos, update details, and delete listings they own.
- **Interactive Maps**: Real-time location maps powered by Leaflet and OpenStreetMap.
- **Reviews & Ratings**: Guests can leave comments and 1- to 5-star ratings with animated star previews.
- **Secure Authentication & Authorization**: User signup, login, session persistence, and role-based permissions (only owners can edit/delete their listings; only authors can delete their reviews).
- **Flash Alerts**: Instant user feedback for actions and error notifications.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (`passport-local`, `passport-local-mongoose`)
- **Session Store**: `express-session`, `connect-mongo`
- **File Uploads**: Multer, Cloudinary (`multer-storage-cloudinary`)
- **Data Validation**: Joi
- **Frontend / Templating**: EJS, `ejs-mate`, Bootstrap 5, FontAwesome 6, Starability CSS
- **Maps**: Leaflet.js & OpenStreetMap

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/1630aniruddhanimbalkar-create/Wanderlust.git
cd Wanderlust
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
ATLASDB_URL=mongodb://127.0.0.1:27017/wanderlust
SECRET=your_secret_key
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

### 4. (Optional) Initialize Sample Listings
```bash
node init/index.js
```

### 5. Start the Application
```bash
npm start
```
Visit `http://localhost:8080` in your browser.
