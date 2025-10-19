import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';
import { DataSource } from 'typeorm';
import accurateApi from './accurate-api';
import { Loan, LoanStatus } from './loan.model';
import { LoanSchema } from './loan.schema';

// Extend the Express Request type to include our custom properties
interface AuthenticatedRequest extends Request {
  employeeId?: number;
}

const app = express();
const port = process.env.PORT || 5000;

// In-memory store for session tokens. In a real app, use a database like Redis.
const sessionStore = new Map<string, number>(); // Map<token, employeeId>

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'koperasi-pegawai',
  entities: [LoanSchema],
  synchronize: true, // Shouldn't be used in production
});

const approvalFlow: Partial<Record<LoanStatus, LoanStatus>> = {
  [LoanStatus.PENDING_STAFF_APPROVAL]: LoanStatus.PENDING_MANAGER_APPROVAL,
  [LoanStatus.PENDING_MANAGER_APPROVAL]: LoanStatus.PENDING_BENDAHARA_APPROVAL,
  [LoanStatus.PENDING_BENDAHARA_APPROVAL]: LoanStatus.PENDING_KETUA_APPROVAL,
  [LoanStatus.PENDING_KETUA_APPROVAL]: LoanStatus.APPROVED,
};

app.use(cors()); // No credentials needed for token auth
app.use(express.json());

// Middleware to authenticate token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // if there isn't any token

  const employeeId = sessionStore.get(token);
  if (employeeId == null) return res.sendStatus(403); // if token is not valid

  req.employeeId = employeeId;
  next();
};

app.get('/api/accurate-auth', (req, res) => {
  const authUrl = `https://account.accurate.id/oauth/authorize?response_type=code&client_id=${process.env.ACCURATE_CLIENT_ID}&redirect_uri=http://localhost:5000/api/accurate-callback&scope=read`;
  res.redirect(authUrl);
});

app.get('/api/accurate-callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }

  try {
    await accurateApi.exchangeCodeForToken(code as string);
    await accurateApi.openDatabase();
    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #1976d2;">✅ Accurate.id Authentication Successful!</h2>
          <p>You have been successfully authenticated with Accurate.id.</p>
          <p>You can now close this window and use the application.</p>
          <a href="http://localhost:3000" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
            Go to Application
          </a>
        </body>
      </html>
    `);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Authentication failed:', error.response?.data || error.message);
    } else {
      console.error('An unexpected error occurred:', error);
    }
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #d32f2f;">❌ Authentication Failed</h2>
          <p>Failed to complete authentication with Accurate.id.</p>
          <a href="/api/accurate-auth" style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
            Try Again
          </a>
        </body>
      </html>
    `);
  }
});

app.get('/api', (req, res) => {
  res.send('Koperasi Pegawai API is running!');
});

app.get('/api/auth-status', async (req, res) => {
  try {
    await accurateApi.ensureAuthenticated();
    res.json({ 
      authenticated: true, 
      message: 'Accurate.id is authenticated and ready' 
    });
  } catch (error) {
    res.status(503).json({ 
      authenticated: false, 
      message: 'Accurate.id authentication required',
      authUrl: '/api/accurate-auth'
    });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Handle admin login separately
  if (username.toLowerCase() === 'admin') {
    const token = crypto.randomBytes(48).toString('hex');
    // For admin, we can use a special ID, e.g., 0 or -1, since there's no employee record
    const adminEmployeeId = 0; 
    sessionStore.set(token, adminEmployeeId);
    console.log(`[Login] Token created for admin user.`);
    
    res.json({ 
      success: true, 
      userType: 'pengurus', 
      message: 'Login successful',
      token: token, 
      user: { name: 'Admin', id: adminEmployeeId } // Provide a mock user object
    });
    return;
  }

  // Existing logic for regular employees
  try {
    // Ensure Accurate.id is authenticated
    await accurateApi.ensureAuthenticated();
    
    const employees = await accurateApi.getEmployees();
    const employee = employees.find((emp: any) => emp.name.toLowerCase() === username.toLowerCase());

    if (employee) {
      const token = crypto.randomBytes(48).toString('hex');
      sessionStore.set(token, employee.id);
      console.log(`[Login] Token created for employeeId: ${employee.id}`);
      
      res.json({ 
        success: true, 
        userType: 'anggota', 
        message: 'Login successful',
        token: token, 
        user: employee 
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid employee name' });
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error && error.message.includes('Accurate.id authentication required')) {
      res.status(503).json({ 
        success: false, 
        message: 'Accurate.id authentication required. Please contact administrator.',
        authUrl: '/api/accurate-auth'
      });
    } else {
      res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
  }
});

app.get('/api/dashboard-data', authenticateToken, async (req: AuthenticatedRequest, res) => {
  console.log(`[Dashboard] Request received for employeeId: ${req.employeeId}`);
  if (!req.employeeId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Ensure Accurate.id is authenticated
    await accurateApi.ensureAuthenticated();
    
    // Fetch basic employee details
    const employeeDetail = await accurateApi.getEmployeeDetail(req.employeeId);
    
    // Fetch the calculated loan balance
    const loanBalance = await accurateApi.getEmployeeLoanBalance(req.employeeId);

    // Combine the data and send the response
    res.json({
      ...employeeDetail,
      utang: loanBalance, // Override the 'utang' field with the correct balance
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    if (error instanceof Error && error.message.includes('Accurate.id authentication required')) {
      res.status(503).json({ message: 'Accurate.id authentication required' });
    } else {
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  }
});

app.get('/api/test-journal', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const receivableAccount = '110303'; // Piutang Karyawan
    const journalData = await accurateApi.getJournalVouchers(receivableAccount);
    res.json(journalData);
  } catch (error) {
    console.error('Failed to fetch test journal data:', error);
    res.status(500).json({ message: 'Failed to fetch test journal data' });
  }
});

app.get('/api/employees', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Ensure Accurate.id is authenticated
    await accurateApi.ensureAuthenticated();
    
    const employees = await accurateApi.getEmployees();
    res.json(employees);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    if (error instanceof Error && error.message.includes('Accurate.id authentication required')) {
      res.status(503).json({ message: 'Accurate.id authentication required' });
    } else {
      res.status(500).json({ message: 'Failed to fetch employees' });
    }
  }
});

app.get('/api/loan-applications', authenticateToken, async (req, res) => {
  const loanRepository = AppDataSource.getRepository(LoanSchema);
  const applications = await loanRepository.find();
  res.json(applications);
});

app.post('/api/loan-applications', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { amount, tenure } = req.body;
  const employeeId = req.employeeId;

  if (!employeeId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const employeeDetail = await accurateApi.getEmployeeDetail(employeeId);
    const loanRepository = AppDataSource.getRepository(LoanSchema);
    const newApplication = loanRepository.create({
      employeeId: employeeId,
      memberName: employeeDetail.name,
      amount,
      tenure,
      status: LoanStatus.PENDING_STAFF_APPROVAL,
    });

    await loanRepository.save(newApplication);
    console.log('New loan application received and saved:', newApplication);
    res.status(201).json({ success: true, message: 'Loan application submitted successfully.' });
  } catch (error) {
    console.error('Failed to create loan application:', error);
    res.status(500).json({ message: 'Failed to create loan application' });
  }
});

app.patch('/api/loan-applications/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const employeeId = req.employeeId;

  if (!employeeId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const loanRepository = AppDataSource.getRepository(LoanSchema);
  const application = await loanRepository.findOneBy({ id: parseInt(id) });

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  if (action === 'approve') {
    const nextStatus = approvalFlow[application.status];
    if (nextStatus) {
      application.status = nextStatus;

      // Set approver based on the current status
      switch (application.status) {
        case LoanStatus.PENDING_MANAGER_APPROVAL:
          application.approver_level_1_id = employeeId;
          break;
        case LoanStatus.PENDING_BENDAHARA_APPROVAL:
          application.approver_level_2_id = employeeId;
          break;
        case LoanStatus.PENDING_KETUA_APPROVAL:
          application.approver_level_3_id = employeeId;
          break;
        case LoanStatus.APPROVED:
          application.approver_level_4_id = employeeId;
          console.log(`Posting approved loan ${id} to Accurate...`);
          try {
            const transDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const description = `Loan disbursement for ${application.memberName}`;

            const cashAccount = '123456789'; // Bank Mandiri Koperasi
            const receivableAccount = '11303'; // Piutang Karyawan

            await accurateApi.createJournalVoucher(transDate, description, application.amount, cashAccount, receivableAccount, application.employeeId);
            console.log(`Successfully posted loan ${id} to Accurate.`);
          } catch (error) {
            console.error(`Failed to post loan ${id} to Accurate:`, error);
          }
          break;
      }

      await loanRepository.save(application);
      console.log(`Application ${id} approved. New status: ${application.status}`);
      res.json(application);
    } else {
      res.status(400).json({ message: 'Application is already in a final state.' });
    }
  } else if (action === 'reject') {
    application.status = LoanStatus.REJECTED;
    await loanRepository.save(application);
    console.log(`Application ${id} rejected.`);
    res.json(application);
  } else {
    res.status(400).json({ message: 'Invalid action.' });
  }
});

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
    console.log("Data Source has been initialized!")
  })
  .catch((error) => console.log("Error during Data Source initialization", error));