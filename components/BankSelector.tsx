"use client";

import { useRouter } from "next/navigation";
import React from "react";

const BankSelector = ({ accounts = [], currentId }: { accounts: any[]; currentId?: string }) => {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const search = new URLSearchParams(window.location.search);
    if (id) search.set("id", id); else search.delete("id");
    // reset to first page when switching banks
    search.delete("page");
    router.push(`${window.location.pathname}?${search.toString()}`);
  };

  return (
    <div className="bank-selector">
      <label className="text-14 text-blue-25 mr-2">Viewing:</label>
      <select value={currentId || ""} onChange={handleChange} className="select-bank">
        {(accounts || []).map((a: any) => (
          <option key={a.appwriteItemId} value={a.appwriteItemId}>{a.name} — {a.mask}</option>
        ))}
      </select>
    </div>
  );
};

export default BankSelector;
