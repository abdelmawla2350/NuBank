"use client"

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet"
import { sidebarLinks } from "@/constants"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Footer from "./Footer"



const MobileNav = ({ user }: MobileNavProps) => {
  const pathname = usePathname()

  // Normalize pathname by removing trailing slash (except root "/")
  const cleanPathname = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger>
          <Image
            src="/icons/hamburger.svg"
            width={30}
            height={30}
            alt="Open menu"
            className="cursor-pointer"
          />
        </SheetTrigger>

        <SheetContent side="left" className="border-none bg-white">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          <Link href="/" className="cursor-pointer flex items-center gap-2 px-4 py-3">
            <Image
              src="/icons/credit-card.svg"
              width={34}
              height={34}
              alt="Bank logo"
              className="object-contain"
            />
            <h1 className="text-2xl font-ibm-plex-serif font-bold text-black">
              Nu Bank
            </h1>
          </Link>

          <nav className="flex flex-col gap-6 pt-10">
            {sidebarLinks.map((item) => {
              // Normalize item.route as well
              const cleanRoute = item.route.endsWith("/") && item.route.length > 1
                ? item.route.slice(0, -1)
                : item.route

              const isActive =
                cleanPathname === cleanRoute ||
                cleanPathname.startsWith(`${cleanRoute}/`)

              return (
                <SheetClose asChild key={item.route}>
                 <Link
  href={item.route}
  className={cn(
    'flex items-center gap-3 px-4 py-3 rounded-md transition-colors duration-200 select-none cursor-pointer',
    isActive
      ? 'bg-gradient-to-r from-blue-400 to-indigo-600 text-white' // exactly like sidebar
      : 'text-gray-700 hover:bg-gray-100'
  )}
>

                    <Image
                      src={item.imgURL}
                      alt={item.label}
                      width={20}
                      height={20}
                      className={cn({
                        'filter brightness-100': isActive,
                        'filter brightness-75': !isActive,
                      })}
                    />
                    <p
                      className={cn("text-md font-semibold", {
                        "text-white": isActive,
                        "text-gray-900": !isActive,
                      })}
                    >
                      {item.label}
                    </p>
                  </Link>
                </SheetClose>
              )
            })}
          </nav>

          {/* Optional user info */}
           <div className="p-4 border-t mt-8 text-center">
            <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div> 

          <Footer user={user} type="mobile" />
        </SheetContent>
        
      </Sheet>


    
    </section>
  )
}

export default MobileNav
