"use client"
import Image from "next/image"
import Link from "next/link"
import { sidebarLinks } from "@/constants"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Footer from "./Footer"

const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <section className="sidebar p-4 w-60 bg-white shadow-lg min-h-screen hidden md:flex">
      <nav className="flex flex-col gap-6">
        <Link href="/" className="mb-12 flex items-center gap-2 cursor-pointer">
          <Image 
            src="/icons/credit-card.svg"
            width={34}
            height={34}
            alt="Bank logo"
            className="w-8 h-8"
          />
          <h1 className="text-2xl font-bold text-gray-900">NU Bank</h1>
        </Link>

        {sidebarLinks.map((item) => {
          const isActive =
            pathname === item.route ||
            pathname.startsWith(`${item.route}/`)

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200",
                isActive ? "bg-gradient-to-r from-blue-400 to-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <div className="relative w-6 h-6">
                <Image   
                  src={item.imgURL}
                  alt={item.label}
                  fill
                  className={cn({
                    'brightness-100 invert-0': isActive,
                    'brightness-75 invert': !isActive,
                  })}
                />
              </div>
              <p className="text-md font-medium">{item.label}</p>
            </Link>
          )
        })}
      </nav>

      <Footer user={user} type="desktop" />
    </section>
  )
}

export default Sidebar;
