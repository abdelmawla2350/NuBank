import HeaderBox from "@/components/ui/HeaderBox";
import TotalBalanceBox from "@/components/ui/TotalBalanceBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { get } from "http";
import react from "react";
import RightSidebar from "@/components/ui/RightSidebar";



const Home = () => {
  const loggedIn = {firstName: 'Malak', lastName: 'Mohamed',email:'contact@jsmastery.pro'} ;
  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
          type="greeting"
          title="Welcome to NU Bank,"
          user={loggedIn?.firstName || "Customer"}
          subtext="Your modern banking platform for everyone."
          />

          <TotalBalanceBox
          accounts={[]}
          totalBanks={1}
          totalCurrentBalance={1250.35}
          />

        </header>
        RECENT TRANSACTIONS
      </div>
<RightSidebar user={loggedIn}
transactions={[]}
banks={[{currentBalance:123.50},{currentBalance:123.50}]}
 />
    </section>
  );
};

export default Home;

    