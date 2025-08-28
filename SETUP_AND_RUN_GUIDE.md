# Money Manager Application - Setup and Run Guide

## 📋 Prerequisites

- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- Git (optional, for version control)

## 🚀 Quick Start Commands

### 1. Initial Setup (First time only)

```bash
# Navigate to project directory
cd "C:\Users\812416\Cursor projects\MoneyManager"

# Install all dependencies for all parts of the application
npm run install:all

# Run the setup script to configure the application
npm run setup
```

### 2. Running the Web Application

#### Option A: Run Both Backend and Frontend Together
```bash
# Start both backend (port 5000) and frontend (port 3000) simultaneously
npm run dev
```

#### Option B: Run Backend and Frontend Separately
```bash
# Terminal 1: Start Backend Server
npm run dev:backend

# Terminal 2: Start Frontend (in a new terminal)
npm run dev:web
```

### 3. Running the Mobile Application

#### Prerequisites for Mobile
```bash
# Install Expo CLI globally (if not already installed)
npm install -g @expo/cli

# Navigate to mobile directory
cd mobile

# Install mobile-specific dependencies
npx expo install react-dom react-native-web @expo/metro-runtime
```

#### Start Mobile Application
```bash
# Navigate to mobile directory
cd mobile

# Start Expo development server with web support
npx expo start --web

# OR start with specific port
npx expo start --web --port 8081
```

## 🌐 Access URLs

### Web Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

### Mobile Application
- **Web Version**: http://localhost:8081
- **Expo Dev Tools**: http://localhost:19002

## 📱 Mobile App Options

### For Web Browser
```bash
cd mobile
npx expo start --web
```

### For Android Emulator
```bash
cd mobile
npx expo start --android
```

### For iOS Simulator (Mac only)
```bash
cd mobile
npx expo start --ios
```

### For Physical Device
```bash
cd mobile
npx expo start
# Then scan the QR code with Expo Go app
```

## 🔧 Troubleshooting Commands

### Kill All Node Processes (if ports are in use)
```bash
# Windows
taskkill /f /im node.exe

# macOS/Linux
pkill -f node
```

### Check Port Usage
```bash
# Windows
netstat -ano | findstr ":3000\|:5000\|:19000\|:19001\|:19002"

# macOS/Linux
lsof -i :3000 -i :5000 -i :19000 -i :19001 -i :19002
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Reinstall Dependencies
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For mobile specifically
cd mobile
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure

```
MoneyManager/
├── backend/          # Node.js API server
│   ├── server.js     # Main server file
│   ├── data/         # JSON data storage
│   └── package.json
├── web/              # React web application
│   ├── src/          # React components
│   └── package.json
├── mobile/           # React Native mobile app
│   ├── src/          # Mobile components
│   └── package.json
└── package.json      # Root package.json
```

## 🎯 Available npm Scripts

### Root Level Scripts
```bash
npm run dev              # Start both backend and web
npm run dev:web          # Start only web application
npm run dev:backend      # Start only backend server
npm run dev:mobile       # Start mobile application
npm run build            # Build for production
npm run install:all      # Install all dependencies
npm run setup            # Run setup script
```

### Backend Scripts
```bash
cd backend
npm run dev              # Start with nodemon
npm start                # Start production server
```

### Web Scripts
```bash
cd web
npm start                # Start development server
npm run build            # Build for production
```

### Mobile Scripts
```bash
cd mobile
npx expo start           # Start Expo development server
npx expo start --web     # Start with web support
npx expo start --android # Start for Android
npx expo start --ios     # Start for iOS
```

## 🔄 Development Workflow

### 1. Start Development Environment
```bash
# Terminal 1: Start backend and web
npm run dev

# Terminal 2: Start mobile (if needed)
cd mobile
npx expo start --web
```

### 2. Open Applications
- **Web App**: Open http://localhost:3000 in Chrome
- **Mobile Web**: Open http://localhost:8081 in Chrome
- **API Testing**: Use http://localhost:5000/api/health

### 3. Development Features
- **Hot Reload**: Both web and mobile apps support hot reloading
- **API Proxy**: Web app proxies API calls to backend automatically
- **Live Reload**: Changes are reflected immediately

## 🛠️ Environment Configuration

### Backend Environment (.env file in backend directory)
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
```

### Web Environment
- Proxy configuration in `web/package.json` points to backend
- No additional environment setup required

### Mobile Environment
- Uses Expo configuration
- API endpoints configured in `mobile/src/services/api.js`

## 📊 Application Features

### Web Application
- User registration and login
- Expense tracking and management
- Dashboard with charts and statistics
- Settings management
- Responsive design

### Mobile Application
- Same features as web app
- Native mobile interface
- Camera integration for receipt scanning
- Offline capability
- Push notifications (if configured)

## 🚨 Common Issues and Solutions

### Port Already in Use
```bash
# Kill processes using the ports
taskkill /f /im node.exe
# Then restart the application
```

### Expo Dependencies Missing
```bash
cd mobile
npx expo install react-dom react-native-web @expo/metro-runtime
```

### Backend Not Starting
```bash
# Check if .env file exists in backend directory
# If not, create it with the content shown above
```

### Mobile App Not Loading
```bash
# Clear Expo cache
npx expo start --clear
```

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure all dependencies are installed
3. Verify ports are not in use
4. Check console logs for error messages

## 🎉 Success Indicators

### Web Application Running Successfully
- Backend shows: "🚀 Money Manager API server running on port 5000"
- Frontend shows: "Compiled successfully!" and opens at http://localhost:3000
- API health check returns: `{"status":"OK","message":"Money Manager API is running"}`

### Mobile Application Running Successfully
- Expo shows QR code and "Web is waiting on http://localhost:8081"
- Mobile app opens in browser at http://localhost:8081
- No dependency errors in console

---

**Happy coding! 🚀** 