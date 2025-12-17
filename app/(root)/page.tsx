import HeaderBox from "@/components/ui/HeaderBox";
import TotalBalanceBox from "@/components/ui/TotalBalanceBox";
import RightSidebar from "@/components/ui/RightSidebar";

// Dummy user matching your User type (add required fields as needed)
const loggedInUser = {
  $id: "user123",
  email: "contact@jsmastery.pro",
  userId: "user123",
  dwollaCustomerUrl: "",
  dwollaCustomerId: "",
  firstName: "Malak",
  lastName: "Mohamed",
  name: "Malak Mohamed",
  address1: "123 Street",
  city: "Cairo",
  state: "Cairo",
  postalCode: "12345",
  dateOfBirth: "1990-01-01",
  ssn: "123-45-6789",
};

// Dummy merged Bank & Account data
const dummyBankAccounts = [
  {
    // Bank props
    $id: "bank1",
    accountId: "acc1",
    bankId: "bankid1",
    accessToken: "token1",
    fundingSourceUrl: "https://dummyfundingsource.com/1",
    userId: "user123",
    sharableId: "share1",

    // Account props
    id: "acc1",
    availableBalance: 120.5,
    currentBalance: 123.5,
    officialName: "Chase Bank Checking",
    mask: "1234",
    institutionId: "ins_1",
    name: "Chase",
    type: "depository",
    subtype: "checking",
    appwriteItemId: "appwrite_acc1",
  },
  {
    // Bank props
    $id: "bank2",
    accountId: "acc2",
    bankId: "bankid2",
    accessToken: "token2",
    fundingSourceUrl: "https://dummyfundingsource.com/2",
    userId: "user123",
    sharableId: "share2",

    // Account props
    id: "acc2",
    availableBalance: 450,
    currentBalance: 456.75,
    officialName: "Bank of America Savings",
    mask: "5678",
    institutionId: "ins_2",
    name: "BOA",
    type: "depository",
    subtype: "savings",
    appwriteItemId: "appwrite_acc2",
  },
];

const totalCurrentBalance = dummyBankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);

const Home = () => {
  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome to NU Bank,"
            user={loggedInUser?.firstName || "Customer"}
            subtext="Your modern banking platform for everyone."
          />

          <TotalBalanceBox
            accounts={dummyBankAccounts}
            totalBanks={dummyBankAccounts.length}
            totalCurrentBalance={totalCurrentBalance}
          />
        </header>

        RECENT TRANSACTIONS
      </div>

      <RightSidebar
        user={loggedInUser}
        transactions={[]} // empty for now
        banks={dummyBankAccounts}
      />
    </section>
  );
};

export default Home;
