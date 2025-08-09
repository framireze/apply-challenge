# Challenge - Contentful Products API

A NestJS API that synchronizes product data from Contentful API every hour, provides public endpoints with pagination and filtering, and private administrative modules for reporting.

## 🚀 Features

- ✅ **Automatic synchronization** every hour with Contentful API
- ✅ **Public API** with pagination (maximum 5 items per page)
- ✅ **Advanced filters** by name, category, brand, price range
- ✅ **Soft delete** for products (won't reappear on app restart)
- ✅ **Private module** with administrative reports protected by JWT
- ✅ **PostgreSQL database** with TypeORM and migrations
- ✅ **Robust validation** of environment variables

## 📋 Prerequisites

- **Node.js** >= 22 (Active LTS)
- **NestJS** 11
- **Docker** and **Docker Compose**
- **npm** or **yarn**
- **PostgreSQL** 15+

## ⚡ Quick Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd apply-challenge
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
# Copy example file
cp .env.example .env

# Edit the .env file with your configurations
```

### 4. Start the database
```bash
# Start PostgreSQL with Docker
npm run docker:up
```

### 5. Run migrations
```bash
# Generate and run migrations
npm run migration:run
```

### 6. Start the application
```bash
# Development mode
npm run start:dev

# API will be available at http://localhost:3000
```

## 🔧 Detailed Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Application
NODE_ENV=development
PORT=3000

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=myapp_user
DB_PASSWORD=secure_password_123
DB_NAME=myapp_db
DB_SSL=false
DB_POOL_SIZE=10

# JWT for private modules
JWT_SECRET=your-super-secret-jwt-key-with-at-least-32-characters
JWT_EXPIRES_IN=7d

# Contentful API (get from your account)
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
CONTENTFUL_ENVIRONMENT=master

# Email notifications (optional)
brevo_endpoint_smtp=https://api.brevo.com/v3/smtp/email
brevo_api_key=your_api_key
email_notification=admin@yourdomain.com
```

### Database Setup

#### Option 1: Docker (Recommended)
```bash
# Start PostgreSQL
npm run docker:up

# View logs
npm run docker:logs

# Reset database
npm run docker:reset
```

#### Option 2: Local PostgreSQL
If you have PostgreSQL installed locally, make sure to:
1. Create the database specified in `DB_NAME`
2. Ensure the user has write permissions
3. Adjust connection variables in `.env`

### Database Migrations

```bash
# Check migration status
npm run migration:show

# Run pending migrations
npm run migration:run

# Generate new migration (when you modify entities)
npm run migration:generate --name=YourMigrationName

# Revert last migration
npm run migration:revert
```

## 🔄 Automatic Synchronization

The application automatically runs a synchronization with Contentful API every hour:

- ✅ Fetches all products from Contentful
- ✅ Compares with existing products using `contentfulId`
- ✅ Creates new products
- ✅ Updates modified products (based on `revision`)
- ✅ Records synchronization statistics

### Synchronization Logs
```bash
# View real-time logs
npm run start:dev

# View specific synchronization logs
tail -f logs/sync.log
```

## 🚀 Production

### Build
```bash
npm run build
```

### Production Environment Variables
```env
NODE_ENV=production
DB_SSL=true
# ... other production-specific configurations
```

### Docker Production
```bash
# Build image
docker build -t challenge-api .

# Run container
docker run -p 3000:3000 --env-file .env.production challenge-api
```

## 📝 Available Scripts

```bash
# Development
npm run start:dev          # Start in development mode
npm run start:debug        # Start with debugger

# Database
npm run docker:up          # Start PostgreSQL
npm run docker:down        # Stop services
npm run docker:reset       # Reset entire database

# Migrations
npm run migration:generate # Generate automatic migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert migration

# Linting and formatting
npm run lint              # ESLint
npm run format            # Prettier
```

## 🛠️ Technology Stack

- **Framework:** NestJS 11
- **Runtime:** Node.js 22 (Active LTS)
- **Database:** PostgreSQL 15
- **ORM:** TypeORM
- **Authentication:** JWT
- **Validation:** class-validator
- **Pagination:** nestjs-typeorm-paginate
- **Scheduling:** @nestjs/schedule
- **Containerization:** Docker & Docker Compose

## 📁 Project Structure

```
src/
├── auth/                   # JWT Authentication
├── products/              # Product CRUD (public)
├── reports/               # Administrative reports (private)
├── contentful/            # Contentful synchronization
├── config/                # Configurations and validations
├── database/              # Database configuration
├── migrations/            # Database migrations
└── common/                # Guards, interceptors, etc.
```

## 🐛 Troubleshooting

### Error: "Missing script: typeorm"
```bash
npm install -D ts-node tsconfig-paths
```

### PostgreSQL connection error
1. Verify that Docker is running
2. Check environment variables in `.env`
3. Run `npm run docker:reset`

### Migration errors
```bash
# Check current status
npm run migration:show

# Reset migrations if necessary
npm run migration:revert
```

### Missing environment variables
The application will validate and show exactly which variables are missing on startup.

### Node.js version issues
Make sure you're using Node.js 22:
```bash
# Check your version
node --version

# Should show v22.x.x
```

### NestJS CLI issues
```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Verify version
nest --version

# Should show 11.x.x
```

## 📋 Development Requirements

### System Requirements
- **Node.js:** 22.x (Active LTS)
- **npm:** 10.x or higher
- **Docker:** 24.x or higher
- **Docker Compose:** 2.x or higher

### Required Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/typeorm": "^11.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/schedule": "^4.0.0",
    "typeorm": "^0.3.20",
    "pg": "^8.11.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "nestjs-typeorm-paginate": "^4.0.4",
    "joi": "^17.9.0"
  },
  "devDependencies": {
    "@types/pg": "^8.10.0",
    "ts-node": "^10.9.0",
    "tsconfig-paths": "^4.2.0"
  }
}
```

## 🔧 Setup Verification

After following the setup steps, verify everything is working:

### 1. Check application health
```bash
# Application should start without errors
npm run start:dev
```

### 2. Verify database connection
```bash
# Should show migration status
npm run migration:show
```

### 3. Check Docker services
```bash
# Should show running PostgreSQL container
docker ps
```

### 4. Test environment validation
The application will validate all required environment variables on startup and display clear error messages if any are missing.

## 👥 Support

For questions or technical support, contact: [your-email@example.com]

---

## 📄 License

This project is part of a technical challenge and is for educational purposes only.