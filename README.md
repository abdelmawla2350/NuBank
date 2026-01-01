# 🏦 NU Bank - Modern Banking Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

NU Bank is a modern, full-featured banking platform that provides users with seamless account management, real-time transaction monitoring, and secure payment processing. Built with cutting-edge technologies and following industry best practices.

## ✨ Features

### 🏠 **Dashboard & Overview**
- **Real-time Balance Display**: Animated counters showing total balance across all connected accounts
- **Account Summary**: Quick overview of all linked bank accounts with current balances
- **Recent Transactions**: Live feed of recent banking activities
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🏦 **Bank Account Management**
- **Multi-Bank Connectivity**: Connect multiple bank accounts via Plaid integration
- **Account Types Support**: Checking, savings, credit cards, and more
- **Real-time Balance Sync**: Automatic balance updates from connected institutions
- **Institution Details**: Complete bank information and branding

### 💳 **Transaction Management**
- **Transaction History**: Comprehensive view of all banking transactions
- **Real-time Sync**: Automatic transaction updates from Plaid
- **Category Classification**: Automatic transaction categorization
- **Advanced Filtering**: Search and filter transactions by date, amount, or category
- **Payment Channel Tracking**: Track transactions by payment method

### 🔄 **Payment Transfer**
- **Secure Transfers**: Safe money transfers between connected accounts
- **Dwolla Integration**: Professional payment processing infrastructure
- **Transfer Status Tracking**: Real-time transfer status updates
- **Transfer History**: Complete record of all money transfers

### 🔐 **Security & Authentication**
- **Secure Authentication**: User authentication and session management
- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Bank-level Security**: Industry-standard security protocols
- **Error Monitoring**: Sentry integration for real-time error tracking

### 📊 **Analytics & Insights**
- **Interactive Charts**: Beautiful data visualizations using Chart.js
- **Balance Analytics**: Visual representation of account balances
- **Spending Patterns**: Insights into spending behavior
- **Real-time Updates**: Live data updates without page refresh

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for responsive design
- **UI Components**: [Radix UI](https://www.radix-ui.com/) for accessibility
- **Icons**: [Lucide React](https://lucide.dev/) for consistent iconography
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation

### **Backend & APIs**
- **Database**: [Appwrite](https://appwrite.io/) for backend services
- **Banking API**: [Plaid](https://plaid.com/) for bank connectivity
- **Payment Processing**: [Dwolla](https://www.dwolla.com/) for money transfers
- **Error Monitoring**: [Sentry](https://sentry.io/) for application monitoring

### **Development Tools**
- **Package Manager**: npm
- **Code Quality**: ESLint for code linting
- **Charts**: [Chart.js](https://www.chartjs.org/) with React wrapper
- **Animation**: [React CountUp](https://www.npmjs.com/package/react-countup) for number animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Plaid account (for banking integration)
- Appwrite account (for backend services)
- Dwolla account (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nu-bank.git
   cd nu-bank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Plaid Configuration
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox # or development/production

   # Appwrite Configuration
   NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
   APPWRITE_API_KEY=your_appwrite_api_key

   # Dwolla Configuration
   DWOLLA_KEY=your_dwolla_key
   DWOLLA_SECRET=your_dwolla_secret
   DWOLLA_ENVIRONMENT=sandbox # or production

   # Sentry Configuration
   SENTRY_DSN=your_sentry_dsn
   SENTRY_ORG=your_sentry_org
   SENTRY_PROJECT=your_sentry_project
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Banking-system/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication pages
│   ├── (root)/                  # Main application pages
│   │   ├── my-banks/           # Bank management
│   │   ├── payment-transfer/   # Payment transfer
│   │   ├── transaction-history/ # Transaction history
│   │   └── page.tsx            # Dashboard home
│   ├── api/                    # API routes
│   │   ├── bank/              # Banking operations
│   │   ├── dwolla/            # Payment processing
│   │   ├── plaid/             # Plaid integration
│   │   └── debug/             # Debug endpoints
│   ├── global-error.jsx       # Global error boundary
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/                  # Reusable components
│   ├── ui/                     # Base UI components
│   ├── AuthForm.tsx           # Authentication
│   ├── BankCard.tsx           # Bank account cards
│   ├── DoughnutChart.tsx      # Data visualization
│   ├── PaymentTransferForm.tsx # Transfer interface
│   ├── RecentTransactions.tsx # Transaction display
│   ├── Sidebar.tsx            # Navigation
│   └── ...
├── lib/                        # Utility libraries
│   ├── actions/               # Server actions
│   │   ├── bank.actions.ts    # Banking operations
│   │   ├── user.actions.ts    # User management
│   │   ├── transaction.actions.ts # Transaction handling
│   │   └── dwolla.actions.ts  # Payment processing
│   ├── appwrite.ts            # Appwrite configuration
│   ├── plaid.ts               # Plaid client setup
│   └── utils.ts               # Utility functions
├── types/                      # TypeScript definitions
│   └── index.d.ts             # Type declarations
├── public/                     # Static assets
│   └── icons/                 # Application icons
├── constants/                  # Application constants
│   └── index.ts               # Configuration constants
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
├── next.config.mjs            # Next.js configuration
└── tsconfig.json              # TypeScript configuration
```

## 🔧 Configuration

### Plaid Setup
1. Create a [Plaid account](https://dashboard.plaid.com/signup)
2. Get your Client ID and Secret keys
3. Configure allowed redirect URIs
4. Set up webhooks for real-time updates

### Appwrite Setup
1. Create an [Appwrite project](https://appwrite.io/)
2. Set up database collections for users, banks, and transactions
3. Configure authentication methods
4. Generate API keys with appropriate permissions

### Dwolla Setup
1. Register for [Dwolla](https://www.dwolla.com/)
2. Obtain API credentials
3. Configure sandbox/production environments
4. Set up webhook endpoints

## 🏃‍♂️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📖 API Documentation

### Banking Endpoints
- `GET /api/bank/link-token` - Create Plaid link token
- `POST /api/bank/add-funding-source` - Add bank account
- `GET /api/debug/get-account` - Get account details

### Payment Endpoints
- `POST /api/dwolla/transfer-status` - Check transfer status
- `POST /api/dwolla/poll` - Poll transfer updates
- `POST /api/dwolla/reconcile` - Reconcile transfers

### Transaction Endpoints
- Integrated with Plaid for real-time transaction sync
- Custom transfer tracking via Appwrite

## 🔒 Security

- **Data Encryption**: All sensitive data encrypted in transit and at rest
- **Secure Authentication**: JWT-based authentication system
- **Bank-level Security**: Industry-standard security protocols
- **Environment Isolation**: Separate configurations for dev/staging/prod
- **Error Monitoring**: Comprehensive error tracking and alerting

## 🚀 Deployment

## 🚀 Live Demo
👉 https://banking-system-theta-eight.vercel.app/sign-in

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Other Platforms
The application can be deployed on any platform supporting Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Plaid](https://plaid.com/) for banking infrastructure
- [Appwrite](https://appwrite.io/) for backend services
- [Dwolla](https://www.dwolla.com/) for payment processing
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support

For support and questions:
- Create an [issue](https://github.com/your-username/nu-bank/issues)
- Email: support@nubank.com
- Documentation: [docs.nubank.com](https://docs.nubank.com)

---

**Built with ❤️ by the NU Bank Team**
