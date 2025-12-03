SecureStay

A modern, secure, and intelligent student accommodation booking platform that directly connects house owners with students/tenants.
SecureStay focuses on safety, transparency, and seamless communication with features like live chat, real-time map view, security ratings based on crime data, and previous tenant feedback.

🚀 Features
🏡 Direct Owner–Tenant Connection

Students can connect directly with house owners—no middlemen.

Owners can list properties with detailed info, images, amenities, and pricing.

💬 Real-Time Chat (Webhook Integrated)

Built-in chat system for fast communication.

Webhook integration ensures real-time message delivery, typing indicators, and notifications.

Secure, encrypted message storage using Firebase.

🗺️ Live Map Integration

Interactive map showing nearby hostels, PGs, apartments, and amenities (cafes, gyms, ATM, buses, etc.).

Distance calculation to colleges/universities.

Smart filters like price range, distance, safety score, ratings.

🔐 Security Rating (Based on Crime Data)

Houses get a Security Score based on:

Crime rate in the area

Locality safety index

Verified police data / public API

Lighting score, CCTV availability

⭐ House Rating (Based on Previous Tenants)

Real reviews from verified tenants

Rating categories include: cleanliness, owner behavior, neighborhood safety, rent fairness, facility quality

Weighted overall rating system

⚡ Fast & Responsive UI

Mobile-first responsive design

Smooth animations with TailwindCSS

Lightning-fast performance with Vite + React

🔥 Firebase Backend

Authentication (Google, Email/Password)

Realtime database / Firestore

Secure storage (house photos, documents)

Webhooks for chat & notifications

🛠️ Setup
1. Install Dependencies
npm install

2. Start Development Server
npm run dev

3. Build for Production
npm run build

🧰 Tech Stack
Layer	Technology
Frontend	React + TypeScript
Styling	TailwindCSS
Build Tool	Vite
Realtime Backend	Firebase (Auth, Firestore, Storage)
Chat Webhooks	Firebase Cloud Functions / Webhook API
Map Services	Google Maps API / Mapbox
Hosting	Firebase Hosting / Vercel
📌 Planned Enhancements

AI-based room recommendation

Fraud detection for listings

Tenant–owner contract generator

Automated rent reminders

360° virtual property visit
