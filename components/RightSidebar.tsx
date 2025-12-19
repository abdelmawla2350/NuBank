"use client"

import Image from 'next/image'
import PlaidLink from './PlaidLink'
import React from 'react'
import BankCard from './BankCard'
import { countTransactionCategories } from '@/lib/utils'
import Category from './Category'

const RightSidebar = ({ user, transactions, banks }: RightSidebarProps) => {
  const categories: CategoryCount[] = countTransactionCategories(transactions);
  const initial = (user?.firstName?.[0] ?? user?.email?.[0] ?? '').toUpperCase();

  return (
    <aside className="right-sidebar">
      <section className="flex flex-col pb-8">
        <div className="profile-banner" />
        <div className="profile">
            <div className="profile-img">
            <span className="text-5xl font-bold text-blue-500">{initial}</span>
          </div>

          <div className="profile-details">
            <h1 className='profile-name'>
              {user?.firstName ?? ''} {user?.lastName ?? ''}
            </h1>
            <p className="profile-email">
              {user?.email ?? ''}
            </p>
          </div>
        </div>
      </section>

      <section className="banks">
        <div className="flex w-full justify-between">
          <h2 className="header-2">My Banks</h2>
          <div className="flex gap-2">
            {/* Use PlaidLink here so clicking Add Bank opens Plaid instead of navigating */}
            <PlaidLink user={user} variant="ghost" />
          </div>
        </div>

        {banks?.length > 0 && (
          <div className="flex flex-col gap-4">
            {banks.map((b: any) => (
              <div key={b.appwriteItemId || b.id} className="w-full">
                <BankCard
                  account={b}
                  userName={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
                  showBalance={false}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-1 flex-col gap-6">
          <h2 className="header-2">Top categories</h2>

          <div className='space-y-5'>
            {categories.map((category, index) => (
              <Category key={category.name} category={category} />
            ))}
          </div>
        </div>
      </section>
    </aside>
  )
}

export default RightSidebar