'use server';

import { ID, Query } from "node-appwrite";
import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";

import { plaidClient } from "../plaid";
import {
  parseStringify,
  extractCustomerIdFromUrl,
  encryptId,
} from "../utils";

import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";

import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();

    // Create session for the user
    const session = await account.createEmailPasswordSession(email, password);

    // Set cookie with session secret
    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(session);
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  let newUserAccount;

  try {
    // Create user in Appwrite
    const { database, account } = await createAdminClient();
    newUserAccount = await account.create(
      ID.unique(),
      userData.email,
      password,
      `${userData.firstName} ${userData.lastName}`
    );

    if (!newUserAccount) throw new Error("Error creating user");

    // Create Dwolla customer
    const dwollaCustomerUrl = await createDwollaCustomer({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email,
      type: "personal",
      address1: userData.address1 || "",
      city: userData.city || "",
      state: userData.state || "",
      postalCode: userData.postalCode || "",
      dateOfBirth: userData.dateOfBirth || "",
      ssn: userData.ssn || "",
    });

    if (!dwollaCustomerUrl) throw new Error("Error creating dwolla customer");

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_USER_COLLECTION_ID = process.env.APPWRITE_USER_COLLECTION_ID!;

    // Save user data to database
    const newUser = await database.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_COLLECTION_ID,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerUrl,
        dwollaCustomerid: dwollaCustomerId, // Appwrite collection uses lowercase 'i'
      }
    );

    // Create session after sign up
    const session = await account.createEmailPasswordSession(
      userData.email,
      password
    );

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error("Error signing up:", error);

    // Cleanup if user was partially created
    if (newUserAccount?.$id) {
      const { user } = await createAdminClient();
      await user.delete(newUserAccount.$id);
    }

    return null;
  }
};

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    // Try to enrich the Appwrite account with the user document (which contains firstName/lastName)
    try {
      const userDoc = await getUserInfo({ userId: user.$id });
      if (userDoc) {
        // Merge document fields (firstName, lastName, etc.) with the account object
        const merged = { ...user, ...userDoc };
        return parseStringify(merged);
      }
    } catch (e) {
      /* ignore and return account */
    }

    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    const cookieStore = await cookies();
    cookieStore.delete("appwrite-session");

    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
};

// CREATE PLAID LINK TOKEN
export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: user.firstName + user.lastName,
      products: ["auth", "transactions"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.error("Error creating Plaid link token:", error);
  }
};

// EXCHANGE PLAID PUBLIC TOKEN
export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    console.log("🔄 Starting Plaid token exchange...");
    
    // Exchange public token for access token and item ID
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    console.log("✅ Plaid token exchanged successfully");

    // Get account info from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];
    console.log("✅ Account data retrieved from Plaid");

    // Get user info to ensure we have dwollaCustomerId
    let userInfo = user;
    if (!user.dwollaCustomerId && !user.dwollaCustomerid) {
      console.log("⚠️ User missing dwollaCustomerId, fetching user info...");
      const fetchedUser = await getUserInfo({ userId: user.$id || user.userId });
      if (fetchedUser) {
        userInfo = fetchedUser;
      }
    }

    let dwollaCustomerId = userInfo.dwollaCustomerId || userInfo.dwollaCustomerid;
    
    // If still no Dwolla customer ID, try to create one using user info
    if (!dwollaCustomerId) {
      console.log("⚠️ No Dwolla customer ID found. Attempting to create one...");
      
      // Try to get full user info from database
      const fullUserInfo = await getUserInfo({ userId: user.$id || user.userId });
      
      if (fullUserInfo && fullUserInfo.email && fullUserInfo.firstName && fullUserInfo.lastName) {
        try {
          const dwollaCustomerUrl = await createDwollaCustomer({
            firstName: fullUserInfo.firstName || "",
            lastName: fullUserInfo.lastName || "",
            email: fullUserInfo.email,
            type: "personal",
            address1: fullUserInfo.address1 || "",
            city: fullUserInfo.city || "",
            state: fullUserInfo.state || "",
            postalCode: fullUserInfo.postalCode || "",
            dateOfBirth: fullUserInfo.dateOfBirth || "",
            ssn: fullUserInfo.ssn || "",
          });

          if (dwollaCustomerUrl) {
            dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
            console.log("✅ Created Dwolla customer:", dwollaCustomerId);
            
            // Update user document with Dwolla customer ID
            try {
              const { database } = await createAdminClient();
              const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
              const APPWRITE_USER_COLLECTION_ID = process.env.APPWRITE_USER_COLLECTION_ID!;
              
              // Find user document
              const userDoc = await database.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_USER_COLLECTION_ID,
                [Query.equal("userId", [user.$id || user.userId])]
              );
              
              if (userDoc.total === 1) {
                await database.updateDocument(
                  APPWRITE_DATABASE_ID,
                  APPWRITE_USER_COLLECTION_ID,
                  userDoc.documents[0].$id,
                  {
                    dwollaCustomerUrl,
                    dwollaCustomerid: dwollaCustomerId,
                  }
                );
                console.log("✅ Updated user document with Dwolla customer ID");
              }
            } catch (updateError) {
              console.warn("⚠️ Could not update user document with Dwolla ID:", updateError);
            }
          }
        } catch (dwollaError: any) {
          console.error("❌ Failed to create Dwolla customer:", dwollaError);
          // For demo purposes, we'll allow bank connection without Dwolla
          // but transfers won't work until Dwolla is set up
          console.warn("⚠️ Continuing without Dwolla customer ID (transfers will be disabled)");
          dwollaCustomerId = null; // Set to null to skip Dwolla steps
        }
      } else {
        console.warn("⚠️ Cannot create Dwolla customer - missing user information");
        // For demo purposes, allow bank connection without Dwolla
        dwollaCustomerId = null;
      }
    }

    // Create funding source only if Dwolla customer ID exists
    let fundingSourceUrl: string | null = null;
    
    if (dwollaCustomerId) {
      try {
        // Create processor token for Dwolla
        const request: ProcessorTokenCreateRequest = {
          access_token: accessToken,
          account_id: accountData.account_id,
          processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;
        console.log("✅ Processor token created");

        // Add funding source - wrap in try-catch to handle insufficient funds gracefully
        try {
          fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
          });

          if (fundingSourceUrl) {
            console.log("✅ Funding source created");
          } else {
            console.warn("⚠️ Funding source creation returned null, but continuing with bank account creation");
          }
        } catch (fundingError: any) {
          // Handle insufficient funds or other Dwolla errors gracefully
          const errorMessage = fundingError?.body?.message || fundingError?.message || "Unknown error";
          console.warn("⚠️ Funding source creation failed:", errorMessage);
          console.warn("⚠️ This might be due to insufficient funds in the account. Bank will be saved as view-only.");
          // Continue without funding source - bank account will be view-only
          fundingSourceUrl = null;
        }
      } catch (processorError: any) {
        console.warn("⚠️ Processor token creation failed:", processorError?.message);
        console.warn("⚠️ Continuing without Dwolla funding source. Bank account will be view-only.");
        fundingSourceUrl = null;
      }
    } else {
      console.warn("⚠️ Skipping Dwolla funding source creation (no Dwolla customer ID). Bank account will be view-only.");
    }

    // Get userId - try both $id and userId properties
    const userId = user.$id || user.userId;
    if (!userId) {
      throw new Error("User ID is missing. Cannot create bank account.");
    }

    // Create bank account document
    console.log("💾 Creating bank account document...", { userId, accountId: accountData.account_id, hasFundingSource: !!fundingSourceUrl });
    const bankAccount = await createBankAccount({
      userId: userId,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl: fundingSourceUrl || "", // Use empty string if null (for Appwrite schema)
      sharaebleId: encryptId(accountData.account_id),
    });

    console.log("✅ Bank account saved to database:", bankAccount);

    return parseStringify({ publicTokenExchange: "complete", bankAccount });
  } catch (error: any) {
    console.error("❌ Error exchanging public token:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      user: { $id: user?.$id, userId: user?.userId, hasDwollaId: !!(user?.dwollaCustomerId || user?.dwollaCustomerid) }
    });
    throw error; // Re-throw so PlaidLink can handle it
  }
};

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_USER_COLLECTION_ID = process.env.APPWRITE_USER_COLLECTION_ID!;

    const user = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_COLLECTION_ID,
      [Query.equal("userId", [userId])]
    );

    if (user.total !== 1) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
};

export const createBankAccount = async ({
  accessToken,
  userId,
  accountId,
  bankId,
  fundingSourceUrl,
  sharaebleId,
}: createBankAccountProps) => {
  try {
    console.log("💾 Creating bank account document with:", {
      userId,
      accountId,
      bankId: bankId?.substring(0, 20) + "...",
      hasAccessToken: !!accessToken,
      hasFundingSourceUrl: !!fundingSourceUrl,
    });

    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

    if (!APPWRITE_DATABASE_ID || !APPWRITE_BANK_COLLECTION_ID) {
      throw new Error("Missing Appwrite database or collection ID environment variables");
    }

    // Create bank account document with camelCase attributes (matching how we read them)
    const bankAccount = await database.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      ID.unique(),
      {
        accessToken,
        userId,
        accountId,
        bankId,
        fundingSourceUrl: fundingSourceUrl || "",
        sharaebleId: sharaebleId || "",
      }
    );

    console.log("✅ Bank account document created successfully:", bankAccount.$id);
    return parseStringify(bankAccount);
  } catch (error: any) {
    console.error("❌ Error creating bank account:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      type: error?.type,
      response: error?.response,
    });
    throw error; // Re-throw so caller can handle it
  }
};

// Get all bank accounts for user
export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

    const banks = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(banks.documents);
  } catch (error) {
    console.error("Error fetching banks:", error);
    return null;
  }
};

// Get bank account by document ID
export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

    // Use getDocument instead of listDocuments with Query.equal for $id
    const bank = await database.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      documentId
    );

    return parseStringify(bank);
  } catch (error) {
    console.error("Error fetching bank:", error);
  }
};

// Get bank account by account ID
export const getBankByAccountId = async ({
  accountId,
}: getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

    const bank = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      [Query.equal("accountId", [accountId])]
    );

    if (bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error("Error fetching bank by accountId:", error);
    return null;
  }
};
