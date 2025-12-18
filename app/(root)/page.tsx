import { redirect } from "next/navigation";

import { HeaderBox, TotalBalanceBox } from "@/components/ui/common";
import { RightSidebar } from "@/components/nav/RightSidebar";
import { RecentTransactions } from "@/components/transaction/RecentTransactions";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";

type SearchParamProps = {
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
};

const Home = async ({ searchParams }: SearchParamProps) => {
  // Safely extract id and page from searchParams
  const id = Array.isArray(searchParams?.id) ? searchParams.id[0] : searchParams?.id;
  const page = Array.isArray(searchParams?.page) ? searchParams.page[0] : searchParams?.page;

  const currentPage = Number(page) || 1;

  const loggedIn = await getLoggedInUser();
  if (!loggedIn) redirect("/sign-in");

  const accounts = await getAccounts({
    userId: loggedIn?.$id,
  });
  if (!accounts) return null;

  const accountsData = accounts?.data;
  const appwriteItemId = id || accountsData[0]?.appwriteItemId;

  const account = await getAccount({ appwriteItemId });

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "Guest"}
            subtext="Access & manage your account and transactions efficiently."
          />

          <TotalBalanceBox
            accounts={accountsData}
            totalBanks={accounts?.totalBanks}
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </header>

        <RecentTransactions
          accounts={accountsData}
          transactions={account?.transactions}
          appwriteItemId={appwriteItemId}
          page={currentPage}
        />
      </div>

      <RightSidebar
        user={loggedIn}
        transactions={account?.transactions}
        banks={accountsData?.slice(0, 2)}
      />
    </section>
  );
};

export default Home;
