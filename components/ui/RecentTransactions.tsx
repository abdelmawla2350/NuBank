import Link from 'next/link';
import { useState } from 'react';
import { BankTabItem } from './BankTabItem';
import BankInfo from './BankInfo';
import TransactionsTable from './TransactionsTable';
import { Pagination } from './Pagination';

const RecentTransactions = ({
  accounts,
  transactions = [],
  appwriteItemId,
  page = 1,
}: RecentTransactionsProps) => {
  const rowsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  const indexOfLastTransaction = page * rowsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const [activeTab, setActiveTab] = useState(appwriteItemId || (accounts[0]?.appwriteItemId ?? ''));

  return (
    <section className="recent-transactions">
      <header className="flex items-center justify-between">
        <h2 className="recent-transactions-label">Recent transactions</h2>
        <Link href={`/transaction-history/?id=${appwriteItemId}`} className="view-all-btn">
          View all
        </Link>
      </header>

      <div className="tabs-list flex space-x-2 mb-4">
        {accounts.map((account: Account) => (
          <button
            key={account.id}
            onClick={() => setActiveTab(account.appwriteItemId)}
            className={`px-4 py-2 rounded ${
              activeTab === account.appwriteItemId ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            <BankTabItem
              account={account}
              appwriteItemId={appwriteItemId}
            />
          </button>
        ))}
      </div>

      {accounts.map((account: Account) =>
        activeTab === account.appwriteItemId ? (
          <div key={account.id} className="space-y-4">
            <BankInfo account={account} appwriteItemId={appwriteItemId} type="full" />
            <TransactionsTable transactions={currentTransactions} />
            {totalPages > 1 && (
              <div className="my-4 w-full">
                <Pagination totalPages={totalPages} page={page} />
              </div>
            )}
          </div>
        ) : null
      )}
    </section>
  );
};

export default RecentTransactions;
