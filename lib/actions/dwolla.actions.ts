"use server";

import { Client } from "dwolla-v2";

/* ---------------------------------------------
   TYPES
--------------------------------------------- */
type NewDwollaCustomerParams = {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  [key: string]: any;
};

type CreateFundingSourceOptions = {
  customerId: string;
  fundingSourceName: string;
  plaidToken: string;
  _links: any;
};

type AddFundingSourceParams = {
  dwollaCustomerId: string;
  processorToken: string;
  bankName: string;
};

type TransferParams = {
  sourceFundingSourceUrl: string;
  destinationFundingSourceUrl: string;
  amount: string | number;
};

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
   STATE ABBREVIATIONS MAP
--------------------------------------------- */
const stateAbbreviations: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
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
   CREATE CUSTOMER WITH STATE VALIDATION
--------------------------------------------- */
export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams
) => {
  try {
    if (newCustomer.state && newCustomer.state.length !== 2) {
      const mappedState = stateAbbreviations[newCustomer.state];
      if (mappedState) {
        newCustomer.state = mappedState;
      } else {
        throw new Error(
          `Invalid state value '${newCustomer.state}'. Must be 2-letter abbreviation or valid full state name.`
        );
      }
    }

    const res = await dwollaClient.post("customers", newCustomer);
    return res.headers.get("location");
  } catch (err: any) {
    console.error("❌ DWOLLA CUSTOMER CREATION FAILED");
    console.error("Status:", err?.status);
    console.error("Body:", JSON.stringify(err?.body, null, 2));

    // If a customer with this email already exists in Dwolla,
    // reuse the existing customer instead of failing signup.
    try {
      const body = err?.body;
      const embeddedErrors = body?._embedded?.errors;

      if (
        body?.code === "ValidationError" &&
        Array.isArray(embeddedErrors)
      ) {
        const duplicateError = embeddedErrors.find(
          (e: any) => e?.code === "Duplicate" && e?.path === "/email"
        );

        const existingCustomerHref =
          duplicateError?._links?.about?.href;

        if (existingCustomerHref) {
          console.warn(
            "⚠️ Dwolla customer already exists for this email. Reusing existing customer URL."
          );
          return existingCustomerHref;
        }
      }
    } catch (parseErr) {
      console.error("Error handling Dwolla duplicate-customer response:", parseErr);
    }

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

// -----------------------------
// Diagnostic helpers (read-only)
// -----------------------------
export const getTransfer = async (transferLocationOrId: string) => {
  try {
    // Accept either a full URL, a relative id/path, or just an id
    let path = transferLocationOrId;

    if (transferLocationOrId.startsWith("http")) {
      const url = new URL(transferLocationOrId);
      path = url.pathname.replace(/^\//, "");
    }

    // If a bare UUID was provided, build the transfers path
    const uuidLike = /^[0-9a-fA-F-]{10,}$/;
    if (!path.includes("/") && uuidLike.test(path)) {
      path = `transfers/${path}`;
    }

    // Ensure transfers/ prefix if user passed an id without it
    if (!path.startsWith("transfers/") && /transfers\//i.test(path) === false && path.match(/^transfers?\//i) === null) {
      // leave as-is; dwollaClient may accept other paths
    }

    const res = await dwollaClient.get(path);

    // Normalize headers into a plain object for JSON serialization
    const headersObj: Record<string, string> = {};
    try {
      if (res?.headers && typeof res.headers.forEach === "function") {
        res.headers.forEach((v: string, k: string) => (headersObj[k] = v));
      } else if (res?.headers) {
        // If headers is an object-like map
        Object.entries(res.headers).forEach(([k, v]) => (headersObj[k] = String(v)));
      }
    } catch (hdrErr) {
      // ignore header parsing errors
    }

    return {
      requestedPath: path,
      status: res?.status ?? null,
      headers: Object.keys(headersObj).length ? headersObj : null,
      body: typeof res?.body !== "undefined" ? res.body : null,
    };
  } catch (err: any) {
    console.error("❌ GET TRANSFER FAILED", err?.status, err?.body);
    throw err;
  }
};

export const getFundingSource = async (fundingSourceUrl: string) => {
  try {
    let path = fundingSourceUrl;
    if (fundingSourceUrl.startsWith("http")) {
      const url = new URL(fundingSourceUrl);
      path = url.pathname.replace(/^\//, "");
    }

    // If a bare UUID was provided, assume it's a funding-source id
    const uuidLike = /^[0-9a-fA-F-]{10,}$/;
    if (!path.includes("/") && uuidLike.test(path)) {
      path = `funding-sources/${path}`;
    }

    const res = await dwollaClient.get(path);

    const headersObj: Record<string, string> = {};
    try {
      if (res?.headers && typeof res.headers.forEach === "function") {
        res.headers.forEach((v: string, k: string) => (headersObj[k] = v));
      } else if (res?.headers) {
        Object.entries(res.headers).forEach(([k, v]) => (headersObj[k] = String(v)));
      }
    } catch (hdrErr) {}

    return {
      requestedPath: path,
      status: res?.status ?? null,
      headers: Object.keys(headersObj).length ? headersObj : null,
      body: typeof res?.body !== "undefined" ? res.body : null,
    };
  } catch (err: any) {
    console.error("❌ GET FUNDING SOURCE FAILED", err?.status, err?.body);
    throw err;
  }
};
