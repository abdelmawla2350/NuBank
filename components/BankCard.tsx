"use client"

import { formatAmount } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

const BankCard = ({ account, userName, showBalance = true }: CreditCardProps) => {
  const [loading, setLoading] = useState(false);

  const addFundingSource = async () => {
    if (!account?.appwriteItemId) return alert('Missing bank id');
    setLoading(true);
    try {
      const res = await fetch('/api/bank/add-funding-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankId: account.appwriteItemId }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Add funding source error:', data);
        alert((data?.error || 'Failed to add funding source') + '\n' + (JSON.stringify(data?.details) || ''));
      } else {
        alert('Funding source added');
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add funding source: ' + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <Link href={`/transaction-history/?id=${account.appwriteItemId}`} className="bank-card">
        <div className="bank-card_content">
          <div>
            <h1 className="text-16 font-semibold text-white">
              {account.name}
            </h1>
            <p className="font-ibm-plex-serif font-black text-white">
              {formatAmount(account.currentBalance)}
            </p>
          </div>

          <article className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-12 font-semibold text-white">
                {userName}
              </h1>
              <h2 className="text-12 font-semibold text-white">
              ●● / ●●
              </h2>
            </div>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● <span className="text-16">{account?.mask}</span>
            </p>
          </article>
        </div>

        <div className="bank-card_icon">
          <Image 
            src="/icons/Paypass.svg"
            width={20}
            height={24}
            alt="pay"
          />
          <Image 
            src="/icons/mastercard.svg"
            width={45}
            height={32}
            alt="mastercard"
            className="ml-5"
          />
        </div>

        <Image 
          src="/icons/lines.png"
          width={316}
          height={190}
          alt="lines"
          className="absolute top-0 left-0"
        />
      </Link>

      {showBalance && <div className="mt-2 flex items-center gap-2">
        <button
          className="ml-2 rounded bg-blue-600 px-3 py-1 text-white text-sm"
          onClick={addFundingSource}
          disabled={loading}
        >
          {loading ? 'Adding…' : (account?.fundingSourceUrl ? 'Funding source' : 'Enable transfers')}
        </button>
      </div>}
    </div>
  )
}

export default BankCard