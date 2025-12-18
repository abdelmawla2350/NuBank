"use server";

import { Client } from "dwolla-v2";

/* ---------------------------------------------
   ENVIRONMENT
--------------------------------------------- */
const getEnvironment = (): "production" | "sandbox" => {
  const environment = process.env.DWOLLA_ENV;

  if (environment === "sandbox") return "sandbox";
  if (environment === "production") return "production";

  throw new Error(
    "DWOLLA_ENV must be set to either 'sandbox' or 'production'"
  );
};

/* ---------------------------------------------
   CLIENT
--------------------------------------------- */
const dwollaClient = new Client({
  environment: getEnvironment(),
  key: process.env.DWOLLA_KEY as string,
  secret: process.env.DWOLLA_SECRET as string,
});

/* ---------------------------------------------
   CREATE CUSTOMER
--------------------------------------------- */
export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams
) => {
  try {
    const res = await dwollaClient.post("customers", newCustomer);
    return res.headers.get("location");
  } catch (err: any) {
    console.error("❌ DWOLLA CUSTOMER CREATION FAILED");
    console.error("Status:", err?.status);
    console.error("Body:", JSON.stringify(err?.body, null, 2));
    throw err;
  }
};

/* ---------------------------------------------
   ON-DEMAND AUTHORIZATION
--------------------------------------------- */
export const createOnDemandAuthorization = async () => {
  try {
    const res = await dwollaClient.post("on-demand-authorizations");
    return res.body._links;
  } catch (err: any) {
    console.error("❌ ON-DEMAND AUTH FAILED");
    console.error("Body:", JSON.stringify(err?.body, null, 2));
    throw err;
  }
};

/* ---------------------------------------------
   FUNDING SOURCE (PLAID)
--------------------------------------------- */
export const createFundingSource = async (
  options: CreateFundingSourceOptions
) => {
  try {
    const res = await dwollaClient.post(
      `customers/${options.customerId}/funding-sources`,
      {
        name: options.fundingSourceName,
        plaidToken: options.plaidToken,
        _links: options._links,
      }
    );

    return res.headers.get("location");
  } catch (err: any) {
    console.error("❌ FUNDING SOURCE CREATION FAILED");
    console.error("Body:", JSON.stringify(err?.body, null, 2));
    throw err;
  }
};

/* ---------------------------------------------
   ADD FUNDING SOURCE (WRAPPER)
--------------------------------------------- */
export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams) => {
  try {
    const authLinks = await createOnDemandAuthorization();

    return await createFundingSource({
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      plaidToken: processorToken,
      _links: authLinks,
    });
  } catch (err) {
    console.error("❌ ADD FUNDING SOURCE FAILED");
    throw err;
  }
};

/* ---------------------------------------------
   TRANSFER
--------------------------------------------- */
export const createTransfer = async ({
  sourceFundingSourceUrl,
  destinationFundingSourceUrl,
  amount,
}: TransferParams) => {
  try {
    const body = {
      _links: {
        source: { href: sourceFundingSourceUrl },
        destination: { href: destinationFundingSourceUrl },
      },
      amount: {
        currency: "USD",
        value: amount,
      },
    };

    const res = await dwollaClient.post("transfers", body);
    return res.headers.get("location");
  } catch (err: any) {
    console.error("❌ TRANSFER FAILED");
    console.error("Body:", JSON.stringify(err?.body, null, 2));
    throw err;
  }
};
