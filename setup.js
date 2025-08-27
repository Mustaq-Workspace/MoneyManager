#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('💰 Money Manager Simple - Setup Script');
console.log('=====================================\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    return true;
  } catch (error) {
    return false;
  }
}

function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  
  if (major < 14) {
    log('❌ Node.js version 14 or higher is required!', 'red');
    log(`Current version: ${version}`, 'red');
    log('Please update Node.js and try again.', 'red');
    process.exit(1);
  }
  
  log(`✅ Node.js version: ${version}`, 'green');
}

function installDependencies() {
  log('\n📦 Installing dependencies...', 'blue');
  
  // Install root dependencies
  log('Installing root dependencies...', 'yellow');
  if (!runCommand('npm install')) {
    log('❌ Failed to install root dependencies', 'red');
    return false;
  }
  
  // Install backend dependencies
  log('Installing backend dependencies...', 'yellow');
  if (!runCommand('npm install', path.join(process.cwd(), 'backend'))) {
    log('❌ Failed to install backend dependencies', 'red');
    return false;
  }
  
  // Install web dependencies
  log('Installing web dependencies...', 'yellow');
  if (!runCommand('npm install', path.join(process.cwd(), 'web'))) {
    log('❌ Failed to install web dependencies', 'red');
    return false;
  }
  
  log('✅ All dependencies installed successfully!', 'green');
  return true;
}

function createEnvironmentFile() {
  const envPath = path.join(process.cwd(), 'backend', '.env');
  
  if (!fs.existsSync(envPath)) {
    const envContent = `# Money Manager Simple Environment Variables
PORT=5000
NODE_ENV=development

# Database
DB_PATH=./database.sqlite

# Security
CORS_ORIGIN=http://localhost:3000
`;
    
    fs.writeFileSync(envPath, envContent);
    log('✅ Created .env file in backend directory', 'green');
  } else {
    log('ℹ️  .env file already exists', 'yellow');
  }
}

function checkPorts() {
  log('\n🔍 Checking if ports are available...', 'blue');
  
  const ports = [3000, 5000];
  const net = require('net');
  
  ports.forEach(port => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close();
      log(`✅ Port ${port} is available`, 'green');
    });
    
    server.on('error', () => {
      log(`⚠️  Port ${port} is already in use`, 'yellow');
    });
  });
}

function showNextSteps() {
  log('\n🎉 Setup completed successfully!', 'green');
  log('\n📋 Next steps:', 'blue');
  log('1. Start the development servers:', 'yellow');
  log('   npm run dev', 'reset');
  log('\n2. Open your browser and go to:', 'yellow');
  log('   http://localhost:3000', 'reset');
  log('\n3. API health check:', 'yellow');
  log('   http://localhost:5000/api/health', 'reset');
  
  log('\n📱 Available commands:', 'blue');
  log('• npm run dev          - Start both backend and web app', 'reset');
  log('• npm run dev:web      - Start only web app', 'reset');
  log('• npm run dev:backend  - Start only backend', 'reset');
  log('• npm run build        - Build for production', 'reset');
  
  log('\n📚 Documentation:', 'blue');
  log('• README.md - Complete setup and usage guide', 'reset');
  log('• API endpoints available at /api/*', 'reset');
  
  log('\n🚀 Happy expense tracking! 💰', 'green');
}

function main() {
  try {
    log('Starting setup process...', 'blue');
    
    // Check Node.js version
    checkNodeVersion();
    
    // Check if package.json files exist
    const requiredFiles = [
      'package.json',
      'backend/package.json',
      'web/package.json'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        log(`❌ Required file not found: ${file}`, 'red');
        log('Please make sure you are in the correct directory.', 'red');
        process.exit(1);
      }
    }
    
    // Install dependencies
    if (!installDependencies()) {
      log('❌ Setup failed during dependency installation', 'red');
      process.exit(1);
    }
    
    // Create environment file
    createEnvironmentFile();
    
    // Check ports
    checkPorts();
    
    // Show next steps
    showNextSteps();
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  main();
}

module.exports = { main };
