"use server";

import {
  ACHClass,
  CountryCode,
  TransferAuthorizationCreateRequest,
  TransferCreateRequest,
  TransferNetwork,
  TransferType,
} from "plaid";

import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get banks from db
    const banks = await getBanks({ userId });

    console.log('getAccounts: found banks count for user', userId, banks?.length ?? 0);
    try {
      console.log('getAccounts: bank ids', (banks || []).map((b: any) => b.$id));
    } catch (e) {
      /* ignore logging issues */
    }

    const accountsResults = await Promise.all(
      (banks || []).map(async (bank: Bank) => {
        try {
          // get each account info from plaid
          const accountsResponse = await plaidClient.accountsGet({
            access_token: bank.accessToken,
          });
          const accountData = accountsResponse.data.accounts[0];

          // get institution info from plaid
          const institution = await getInstitution({
            institutionId: accountsResponse.data.item.institution_id!,
          });

          const account = {
            id: accountData.account_id,
                  availableBalance: accountData.balances.available!,
                  // Adjust current balance by local transfer transactions (Appwrite)
                  currentBalance: accountData.balances.current!,
            institutionId: institution.institution_id,
            name: accountData.name,
            officialName: accountData.official_name,
            mask: accountData.mask!,
            type: accountData.type as string,
            subtype: accountData.subtype! as string,
            appwriteItemId: bank.$id,
            sharaebleId: bank.shareableId,
          };

                try {
                  // Fetch Appwrite transfer transactions for this bank to compute net transfer impact
                  const transferData = await getTransactionsByBankId({ bankId: bank.$id });

                  // transferData may be a parsed object with `documents` array
                  const transferDocs = transferData?.documents ?? [];

                  // Compute net transfer amount (credits positive, debits negative).
                  // Normalize returned amounts defensively (some sources may return cents).
                  const netDollars = transferDocs.reduce((sum: number, t: any) => {
                    let amt = Number(t.amount) || 0; // may be dollars or cents
                    if (amt > 100) amt = amt / 100; // convert cents -> dollars if needed
                    if (t.senderBankId === bank.$id) return sum - amt; // debit
                    if (t.receiverBankId === bank.$id) return sum + amt; // credit
                    return sum;
                  }, 0);

                  account.currentBalance = Number((account.currentBalance + netDollars).toFixed(2));
                } catch (e) {
                  // If transfer lookup fails, leave Plaid balance as-is
                  console.warn(`Could not adjust balance for bank ${bank.$id}:`, e);
                }

                return account;
        } catch (err: any) {
          console.error(`Failed to fetch Plaid account for bank ${bank.$id}:`, err?.response?.data || err?.message || err);
          try {
            console.error('Plaid accountsGet error config:', err?.config?.data || err?.config);
          } catch (e) {}
          return null;
        }
      })
    );

    const accounts = (accountsResults || []).filter(Boolean) as any[];
    console.log('getAccounts: mapped accounts count', accounts.length, 'ids', accounts.map(a => a.appwriteItemId));

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total, account) => {
      return total + account.currentBalance;
    }, 0);

    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
    // Return empty array on error so callers can safely iterate
    return parseStringify([]);
  }
};

// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    // get bank from db
    const bank = await getBank({ documentId: appwriteItemId });

    // get account info from plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });
    const accountData = accountsResponse.data.accounts[0];

    

    // get institution info from plaid
    const institution = await getInstitution({
      institutionId: accountsResponse.data.item.institution_id!,
    });

    const transactionsResult = await getTransactions({
      accessToken: bank?.accessToken,
    });

    // normalize transactions result to an array
    const transactions = Array.isArray(transactionsResult)
      ? transactionsResult
      : transactionsResult?.documents ?? [];

    // get transfer transactions from appwrite and normalize amounts to dollars
    let transferTransactions: any[] = [];
    try {
      const transferTransactionsData = await getTransactionsByBankId({
        bankId: bank.$id,
      });

      transferTransactions = (transferTransactionsData.documents || []).map(
        (transferData: Transaction) => {
          let amt = Number(transferData.amount) || 0;
          // Defensive: if amt looks like cents (e.g. > 100), convert to dollars
          if (amt > 100) amt = amt / 100;

          return {
            id: transferData.$id,
            name: transferData.name!,
            amount: amt,
            date: transferData.$createdAt,
            paymentChannel: transferData.channel,
            category: transferData.category,
            type: transferData.senderBankId === bank.$id ? "debit" : "credit",
            senderBankId: transferData.senderBankId,
            receiverBankId: transferData.receiverBankId,
          };
        }
      );
    } catch (e) {
      console.warn(`Could not fetch transfer transactions for bank ${bank.$id}:`, e);
    }

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available!,
      currentBalance: accountData.balances.current!,
      institutionId: institution.institution_id,
      name: accountData.name,
      officialName: accountData.official_name,
      mask: accountData.mask!,
      type: accountData.type as string,
      subtype: accountData.subtype! as string,
      appwriteItemId: bank.$id,
    };

    // Apply net transfer adjustment (if any) to the Plaid current balance
    try {
      const netDollars = transferTransactions.reduce((sum: number, t: any) => {
        const amt = Number(t.amount) || 0;
        if (t.senderBankId === bank.$id) return sum - amt;
        if (t.receiverBankId === bank.$id) return sum + amt;
        return sum;
      }, 0);

      if (netDollars !== 0) {
        account.currentBalance = Number((account.currentBalance + netDollars).toFixed(2));
      }
    } catch (e) {
      // ignore
    }

    // sort transactions by date such that the most recent transaction is first
    const allTransactions = [...transactions, ...transferTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("An error occurred while getting the account:", error);
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    const intitution = institutionResponse.data.institution;

    return parseStringify(intitution);
  } catch (error) {
    console.error("An error occurred while getting the accounts (transactions sync):", error);
    // If Plaid returns an error (e.g., missing transactions consent), return empty transactions
    try {
      const errObj: any = error as any;
      if (errObj?.response?.data) {
        console.error('Plaid error details:', errObj.response.data);
      }
    } catch (e) {
      /* ignore */
    }
    return parseStringify([]);
  }
};

// Get transactions
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let transactions: any = [];

  try {
    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
      });

      const data = response.data;

      transactions = response.data.added.map((transaction) => ({
        id: transaction.transaction_id,
        name: transaction.name,
        paymentChannel: transaction.payment_channel,
        type: transaction.payment_channel,
        accountId: transaction.account_id,
        amount: transaction.amount,
        pending: transaction.pending,
        category: transaction.category ? transaction.category[0] : "",
        date: transaction.date,
        image: transaction.logo_url,
      }));

      hasMore = data.has_more;
    }

    return parseStringify(transactions);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};