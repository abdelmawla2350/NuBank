"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_TRANSACTION_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

export const createTransaction = async (transaction: CreateTransactionProps) => {
  try {
    const { database } = await createAdminClient();

    // Build a payload that matches the Appwrite collection schema.
    // Do NOT include attributes that the collection doesn't recognize (e.g. `senderId`/`receiverId`).
    const payload: any = {
      channel: 'online',
      category: 'Transfer',
      name: transaction.name,
      // Appwrite expects an integer for amount (store cents)
      amount: Number.isInteger(transaction.amount)
        ? transaction.amount
        : Math.round(Number(transaction.amount) * 100),
      senderBankId: transaction.senderBankId,
      receiverBankId: transaction.receiverBankId,
    };

    // Optional date field (useful for reconciling to external transfer timestamps)
    if (transaction.date) {
      payload.date = transaction.date;
    }

    // Optional status (e.g., from external processor like Dwolla)
    if (transaction.status) {
      payload.status = transaction.status;
    }

    // Appwrite collection requires `userId` — derive from provided values if missing.
    payload.userId = transaction['userId'] || transaction['senderId'] || transaction['receiverId'] || null;

    const newTransaction = await database.createDocument(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      ID.unique(),
      payload
    );

    return parseStringify(newTransaction);
  } catch (error) {
    console.log(error);
  }
}

export const getTransactionsByBankId = async ({bankId}: getTransactionsByBankIdProps) => {
  try {
    const { database } = await createAdminClient();

    const senderTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal('senderBankId', bankId)],
    )

    const receiverTransactions = await database.listDocuments(
      DATABASE_ID!,
      TRANSACTION_COLLECTION_ID!,
      [Query.equal('receiverBankId', bankId)],
    );

    const transactions = {
      total: senderTransactions.total + receiverTransactions.total,
      documents: [
        // Normalize amounts (stored as integer cents) to numbers for UI convenience when consumed
        // Convert stored cents into dollars for UI consumers
        ...senderTransactions.documents.map((d: any) => ({ ...d, amount: Number(d.amount) / 100 })),
        ...receiverTransactions.documents.map((d: any) => ({ ...d, amount: Number(d.amount) / 100 })),
      ]
    }

    return parseStringify(transactions);
  } catch (error) {
    console.log(error);
  }
}