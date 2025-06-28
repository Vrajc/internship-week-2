# internship-week-2

♻️ EcoClassify
EcoClassify is a smart web-based application for E-waste classification using Deep Learning and Machine Learning models. Built with the powerful MERN Stack (MongoDB, Express, React, Node.js), this platform empowers users to upload electronic waste images and receive instant classification results along with hazardous element insights.

🚀 Features
📸 Upload and classify images of electronic waste
🧠 Integrated Deep Learning (CNN) and ML models (SVM, Random Forest)
📊 Get category-wise info & hazardous materials (e.g., Lead, Mercury)
🧾 Admin-only dashboard to manage datasets & reports
⬇️ Downloadable classification reports
🔐 User Authentication & Role-based Access (User/Admin)
💻 Tech Stack
Frontend:
React.js + TypeScript
Tailwind CSS
Vite.js
Backend:
Node.js + Express.js
MongoDB (Database)
JWT Authentication
AI/ML:
Python (TensorFlow / Keras + Scikit-learn)
CNN for classification
SVM & Random Forest for additional model support
🛠️ Installation & Startup Guide
Follow the steps below to set up and run the EcoClassify project locally.

📁 1. Clone the Repository
git clone https://github.com/your-username/EcoClassify.git
cd EcoClassify

🔧 2. Install Frontend Dependencies

bash

cd frontend
npm install
Start the React development server:

bash

npm run dev
🌐 The app will run at: http://localhost:5173

🔧 3. Install Backend Dependencies
Open a new terminal and run:

bash

cd backend
npm install
Start the backend server:

bash

npm run dev
🌐 The API will be available at: http://localhost:5000


🤖 4. Run Python ML Model Server (Optional)
If you're using the ML model separately via an API:

bash

cd backend/ml-model
pip install -r requirements.txt
python model_api.py

⚙️ 5. Environment Variables
Create a .env file inside the backend folder and configure:

env

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

You're all set! 🎉
Access the frontend, register/login, and start classifying e-waste
