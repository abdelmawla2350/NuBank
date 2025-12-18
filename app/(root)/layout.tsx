import Image from "next/image";
import { redirect } from "next/navigation";

import MobileNav from "@/components/nav/MobileNav";
import Sidebar from "@/components/nav/Sidebar";
import { getLoggedInUser } from "@/lib/actions/user.actions";

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) redirect("/sign-in");

  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar user={loggedIn} />
      <div className="flex size-full flex-col">
        <div className="root-layout">
          <Image src="/icons/logo.svg" width={30} height={30} alt="menu icon" />
          <div>
            <MobileNav user={loggedIn} />
          </div>
        </div>
        {children}
      </div>
import MobileNav from "@/components/ui/MobileNav";
import Sidebar from "@/components/ui/Sidebar";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 


  
  const loggedIn = await getLoggedInUser();
  if (!loggedIn) {
    redirect('/sign-in');
  }
  return (
    <main className="flex h-screen w-full font-inter">
      
      {/* Sidebar only visible md and up */}
      <div className="hidden md:flex">
        <Sidebar user={loggedIn} />
      </div>
      
      <div className="flex size-full flex-col flex-1">
        {/* MobileNav only visible below md */}
        <div className="md:hidden">
          <MobileNav user={loggedIn} />
        </div>

        {/* Your main content */}
        {children}
      </div>
      
    </main>
  );
};

export default RootLayout;
