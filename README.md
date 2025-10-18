# Koperasi Pegawai Biro Klasifikasi Indonesia Web Application

A fullstack web application for managing cooperative employee data, loans, and financial transactions with integration to Accurate.id accounting system.

## Features

### 🏠 Homepage
- Professional landing page with company information
- Feature highlights and statistics
- Modern, responsive design

### 👤 Anggota (Member) Dashboard
- **Data Pribadi**: Complete employee information from Accurate.id
- **Sisa Pinjaman**: Current loan balance tracking
- **Simpanan**: Savings management (coming soon)
- **Pengajuan Pinjaman**: Loan application with simulation

### 👨‍💼 Pengurus (Management) Dashboard
- **Data Anggota**: All employee data from Accurate.id
- **Multilevel Approval**: Staff → Manager → Bendahara → Ketua approval workflow
- **Loan Management**: Complete loan application processing

## Technology Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **TypeORM** for database management
- **PostgreSQL** database
- **Accurate.id API** integration

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for modern UI components
- **React Router** for navigation
- **Axios** for API communication

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Accurate.id account and API credentials

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd koperasi-pegawai-webapp
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   ACCURATE_CLIENT_ID=your_accurate_client_id
   ACCURATE_CLIENT_SECRET=your_accurate_client_secret
   ACCURATE_DATABASE_ID=your_accurate_database_id
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=koperasi-pegawai
   PORT=5000
   ```

4. **Database Setup**
   - Create PostgreSQL database named `koperasi-pegawai`
   - The application will automatically create tables on first run

5. **Accurate.id Integration**
   - Obtain API credentials from Accurate.id
   - Configure OAuth redirect URI: `http://localhost:5000/api/accurate-callback`
   - **One-time Authentication**: Visit `/admin` to authenticate with Accurate.id once

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start both backend (port 5000) and frontend (port 3000) concurrently.

### First Time Setup
1. Start the application: `npm run dev`
2. Visit `http://localhost:3000/admin` to authenticate with Accurate.id
3. Complete the OAuth flow (one-time only)
4. Return to the application - authentication is now persistent

### Individual Services
```bash
# Backend only
npm run server

# Frontend only
npm run client
```

## API Endpoints

### Authentication
- `POST /api/login` - User login (Anggota/Pengurus)
- `GET /api/accurate-auth` - Initiate Accurate.id OAuth flow
- `GET /api/accurate-callback` - OAuth callback from Accurate.id
- `GET /api/auth-status` - Check Accurate.id authentication status

### Data
- `GET /api/dashboard-data` - Member dashboard data
- `GET /api/employees` - All employees (Pengurus only)
- `GET /api/test-journal` - Journal voucher test

### Loan Management
- `GET /api/loan-applications` - Get loan applications
- `POST /api/loan-applications` - Create loan application
- `PATCH /api/loan-applications/:id` - Approve/reject loan

## User Roles

### Anggota (Member)
- View personal data and financial information
- Check loan balance and payment history
- Submit loan applications with simulation
- Access to savings information (coming soon)

### Pengurus (Management)
- View all employee data
- Process loan applications through multilevel approval
- Access comprehensive financial reports
- Manage cooperative operations

## Loan Approval Workflow

1. **Staff Approval** - Initial review
2. **Manager Approval** - Department head review
3. **Bendahara Approval** - Treasurer approval
4. **Ketua Approval** - Final approval
5. **Automatic Processing** - Integration with Accurate.id

## Accurate.id Integration

The application integrates with Accurate.id for:
- Employee data synchronization
- Financial transaction recording
- Loan disbursement processing
- Real-time balance updates

## Security Features

- JWT token-based authentication
- Role-based access control
- Secure API endpoints
- Data encryption for sensitive information

## Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── App.tsx
├── accurate-api.ts         # Accurate.id API integration
├── index.ts               # Express server
├── loan.model.ts          # TypeScript interfaces
├── loan.schema.ts         # TypeORM entities
└── package.json
```

### Adding New Features
1. Create components in `client/src/components/`
2. Add API endpoints in `index.ts`
3. Update database schema if needed
4. Test with both user roles

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are properly configured:
- Database connection strings
- Accurate.id API credentials
- JWT secrets
- CORS settings

## Support

For technical support or questions:
- Email: support@koperasi-bki.id
- Documentation: [Link to detailed docs]

## License

© 2024 Koperasi Pegawai Biro Klasifikasi Indonesia. All rights reserved.