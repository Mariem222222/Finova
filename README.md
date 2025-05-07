# Finova - Personal Finance Management Platform

## Overview
Finova is a comprehensive personal finance management platform designed to help users track their expenses, set savings goals, and make informed financial decisions. With features like expense tracking, savings goals, chatbot assistance, and personalized recommendations, Finova makes financial management accessible and efficient.

## Features
- **Expense Tracking**: Monitor and categorize your daily expenses
- **Savings Goals**: Set and track your financial objectives
- **AI Chatbot**: Get instant answers to your financial questions
- **Smart Recommendations**: Receive personalized financial advice
- **Secure Authentication**: Google OAuth integration for safe access
- **User Dashboard**: Visualize your financial data
- **File Management**: Upload and manage financial documents

## Technologies Used
### Frontend
- React.js
- Material UI
- Chart.js for data visualization
- Axios for API requests

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- JWT Authentication
- Google OAuth 2.0
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Mariem222222/Finova.git
cd Finova
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Create environment variables
Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Start the development servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
- Project Link: [https://github.com/Mariem222222/Finova](https://github.com/Mariem222222/Finova)

## Acknowledgments
- Thanks to all contributors who have helped shape Finova
- Special thanks to the open-source community for the tools and libraries used in this project 