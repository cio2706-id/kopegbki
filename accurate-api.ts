import axios from 'axios';

class AccurateApi {
  private clientId: string;
  private clientSecret: string;
  private databaseId: string;
  private accessToken: string | null = null;
  private sessionId: string | null = null;

  constructor() {
    this.clientId = process.env.ACCURATE_CLIENT_ID || '';
    this.clientSecret = process.env.ACCURATE_CLIENT_SECRET || '';
    this.databaseId = process.env.ACCURATE_DATABASE_ID || '';

    if (!this.clientId || !this.clientSecret || !this.databaseId) {
      throw new Error('Accurate API credentials are not set in the environment variables.');
    }
  }

  async exchangeCodeForToken(code: string): Promise<void> {
    const tokenUrl = 'https://account.accurate.id/oauth/token';
    const redirectUri = 'http://localhost:5000/api/accurate-callback';

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('redirect_uri', redirectUri);

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
    });

    this.accessToken = response.data.access_token;
    console.log('Access Token obtained.');
  }

  async openDatabase(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Access token is not available. Cannot open database.');
    }

    const openDbUrl = `https://account.accurate.id/api/open-db.do?id=${this.databaseId}`;

    const response = await axios.get(openDbUrl, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    this.sessionId = response.data.session;
    console.log('Database opened. Session ID obtained.');
  }

  async getEmployees() {
    if (!this.sessionId || !this.accessToken) {
      throw new Error('Not authenticated. Please call authenticate() first.');
    }
    console.log('Fetching employees...');

    const employeeListUrl = 'https://zeus.accurate.id/accurate/api/employee/list.do';

    const response = await axios.get(employeeListUrl, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Session-ID': this.sessionId,
      },
    });

    return response.data.d; // Return the array of employees
  }

  async getEmployeeDetail(id: number) {
    if (!this.sessionId || !this.accessToken) {
      throw new Error('Not authenticated. Please call authenticate() first.');
    }
    console.log(`Fetching detail for employee id: ${id}...`);

    const employeeDetailUrl = `https://zeus.accurate.id/accurate/api/employee/detail.do?id=${id}`;

    const response = await axios.get(employeeDetailUrl, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Session-ID': this.sessionId,
      },
    });

    return response.data.d; // Return the detailed employee object
  }

  async getJournalVouchers(accountNo: string) {
    return this.getJournalVoucherList(accountNo);
  }

  private async getJournalVoucherList(accountNo: string) {
    if (!this.sessionId || !this.accessToken) {
      throw new Error('Not authenticated.');
    }
    const params = new URLSearchParams({
      'sp.page': '1',
      'sp.pageSize': '200',
      'filter.accountNo.op': 'EQUAL',
      'filter.accountNo.val': accountNo,
    });
    const journalListUrl = `https://zeus.accurate.id/accurate/api/journal-voucher/list.do?${params.toString()}`;
    const response = await axios.get(journalListUrl, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Session-ID': this.sessionId,
      },
    });
    return response.data.d || [];
  }

  private async getJournalVoucherDetail(id: number) {
    if (!this.sessionId || !this.accessToken) {
      throw new Error('Not authenticated.');
    }
    const detailUrl = `https://zeus.accurate.id/accurate/api/journal-voucher/detail.do?id=${id}`;
    const response = await axios.get(detailUrl, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Session-ID': this.sessionId,
      },
    });
    return response.data.d;
  }

  async getEmployeeLoanBalance(employeeId: number): Promise<number> {
    if (!this.sessionId || !this.accessToken) {
      throw new Error('Not authenticated.');
    }
    console.log(`Fetching loan balance for employee ID: ${employeeId}...`);

    const receivablesAccount = '110303';
    
    const transactionSummaries = await this.getJournalVoucherList(receivablesAccount);
    console.log(`Found ${transactionSummaries.length} transactions in receivables account. Fetching details...`);

    const transactionDetails = await Promise.all(
      transactionSummaries.map((t: { id: number }) => this.getJournalVoucherDetail(t.id))
    );

    const balance = transactionDetails.reduce((sum: number, transaction: any) => {
      if (!transaction || !transaction.detailJournalVoucher) return sum;
      
      const detail = transaction.detailJournalVoucher.find((d: any) => 
        d.glAccount.no === receivablesAccount && d.employeeId === employeeId
      );

      if (detail) {
        const debit = detail.debitAmount || 0;
        const credit = detail.creditAmount || 0;
        return sum + debit - credit;
      }
      
      return sum;
    }, 0);

    console.log(`Calculated loan balance for employee ${employeeId}: ${balance}`);
    return balance;
  }

  async createJournalVoucher(
    transDate: string, 
    description: string, 
    amount: number, 
    cashAccount: string, 
    receivableAccount: string,
    employeeId: number
  ) {
    if (!this.sessionId || !this.accessToken) {
      throw new Error('Not authenticated. Please call authenticate() first.');
    }
    console.log('Creating journal voucher...');

    const journalVoucherUrl = 'https://zeus.accurate.id/accurate/api/journal-voucher/save.do';

    const payload = {
      transDate: transDate,
      description: description,
      detail: [
        {
          accountNo: receivableAccount,
          debit: amount,
          credit: 0,
          employeeId: employeeId,
        },
        {
          accountNo: cashAccount,
          debit: 0,
          credit: amount,
        },
      ],
    };

    const response = await axios.post(journalVoucherUrl, payload, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Session-ID': this.sessionId,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

const accurateApi = new AccurateApi();
export default accurateApi;
