# 💰 Money Manager Simple

A simple and intuitive expense tracking application for web and mobile platforms that helps you manage your daily expenses, visualize spending patterns, and stay on top of your budget.

## ✨ Features

### 📱 Core Functionality
- **Add Expenses**: Quick and easy expense entry with amount, category, date, and description
- **Edit & Delete**: Modify or remove existing expenses with inline editing
- **Categories**: Pre-defined categories (Food, Transport, Shopping, Bills, Entertainment, Others)
- **Search & Filter**: Find expenses by date range, category, or description

### 📊 Dashboard & Analytics
- **Monthly Overview**: Total spent this month vs last month with percentage change
- **Category Breakdown**: Interactive pie chart showing spending distribution
- **Daily Trends**: Line chart displaying spending patterns over time
- **Top Categories**: Bar chart of highest expense categories
- **Quick Statistics**: Daily averages and spending insights

### ⚙️ Settings & Management
- **Budget Settings**: Set monthly budget with progress tracking
- **Currency Support**: Multiple currency options (USD, EUR, GBP, JPY, CAD, AUD)
- **Data Export/Import**: Backup and restore your expense data
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MoneyManagerSimple
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend API server (port 5000) and the React web app (port 3000).

### Access the Application
- **Web App**: http://localhost:3000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
MoneyManagerSimple/
├── backend/                 # Node.js/Express API server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── database.sqlite     # SQLite database (auto-created)
├── web/                    # React web application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Helper functions
│   │   └── App.js          # Main app component
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── mobile/                 # React Native app (future)
├── package.json            # Root package.json with scripts
└── README.md              # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Recharts** - Chart components
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Date-fns** - Date manipulation

## 📱 Available Scripts

### Root Level
```bash
npm run dev              # Start both backend and web app
npm run dev:web          # Start only web app
npm run dev:backend      # Start only backend
npm run build            # Build both apps
npm run install:all      # Install all dependencies
```

### Backend
```bash
cd backend
npm run dev              # Start with nodemon (development)
npm start                # Start production server
```

### Web App
```bash
cd web
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
```

## 🔧 API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses (with optional filters)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Statistics
- `GET /api/statistics` - Get expense statistics
- `GET /api/statistics?start_date=X&end_date=Y` - Get filtered statistics

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings

### Health
- `GET /api/health` - API health check

## 🎨 Features in Detail

### Dashboard
- **Quick Add Button**: One-click access to add new expenses
- **Monthly Statistics**: Current month total with comparison to last month
- **Daily Average**: Average daily spending calculation
- **Top Category**: Most used spending category with icon
- **Recent Expenses**: Latest 5 expenses with quick view
- **Quick Actions**: Direct links to charts, expenses list, and settings

### Add Expense
- **Quick Amount Buttons**: Pre-defined amounts ($5, $10, $20, $50, $100, $200)
- **Category Selection**: Dropdown with icons for each category
- **Date Picker**: Easy date selection (defaults to today)
- **Description Field**: Optional notes for each expense
- **Form Validation**: Real-time validation with error messages
- **Success Feedback**: Confirmation and auto-redirect to dashboard

### Expense List
- **Search Functionality**: Search by description, category, or amount
- **Category Filter**: Filter expenses by specific categories
- **Inline Editing**: Edit expenses directly in the list
- **Delete Confirmation**: Safe deletion with confirmation dialog
- **Responsive Design**: Works on all screen sizes

### Charts & Analytics
- **Pie Chart**: Category breakdown with percentages
- **Bar Chart**: Top spending categories
- **Area Chart**: Daily spending trends
- **Interactive Tooltips**: Hover for detailed information
- **Color-coded Categories**: Consistent color scheme across charts
- **Period Selection**: View current month or all-time data

### Settings
- **Budget Management**: Set and track monthly spending limits
- **Currency Options**: Support for multiple currencies
- **Default Category**: Pre-select favorite category for new expenses
- **Data Export**: Download all data as JSON file
- **Data Import**: Restore data from exported files
- **Data Clear**: Safely clear all data with confirmation

## 📱 Mobile Responsiveness

The web application is fully responsive and optimized for:
- **Desktop**: Full-featured experience with all charts and detailed views
- **Tablet**: Adapted layout with touch-friendly controls
- **Mobile**: Streamlined interface with bottom navigation and simplified forms

## 🔒 Data Security

- **Local Storage**: All data is stored locally in SQLite database
- **No Cloud Dependencies**: Works completely offline
- **Data Export**: Backup your data anytime
- **Privacy First**: No data is sent to external servers

## 🚀 Deployment

### Backend Deployment
1. Build the backend:
   ```bash
   cd backend
   npm install --production
   ```

2. Set environment variables:
   ```bash
   PORT=5000
   NODE_ENV=production
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Frontend Deployment
1. Build the web app:
   ```bash
   cd web
   npm run build
   ```

2. Serve the `build` folder with any static file server (nginx, Apache, etc.)

3. Update the API URL in production if needed:
   ```bash
   REACT_APP_API_URL=https://your-api-domain.com/api
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🎯 Roadmap

### Planned Features
- [ ] React Native mobile app
- [ ] Cloud sync between devices
- [ ] Budget alerts and notifications
- [ ] Receipt photo upload
- [ ] Recurring expenses
- [ ] Expense sharing with family members
- [ ] Advanced reporting and insights
- [ ] Multiple accounts/wallets
- [ ] Tax reporting features

### Future Enhancements
- [ ] Dark mode theme
- [ ] Custom categories
- [ ] Expense tags
- [ ] Goal-based saving
- [ ] Investment tracking
- [ ] Bill reminders

---

**Made with ❤️ for better financial management**
