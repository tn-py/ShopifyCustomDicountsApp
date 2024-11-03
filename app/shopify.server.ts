// shopify.server.ts
import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import prisma from "./db.server";

// Initialize Shopify app
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

// Export Shopify instance for use across the app
export default shopify;

// Simplify product fetching for reuse in other modules
export const fetchProducts = async (session: any, limit: number = 50) => {
  try {
    const response = await restResources.Product.all({
      session,
      limit,
    });
    return response?.products || [];  // Adjust according to actual API response
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Helper function for handling authentication in loader functions
export const authenticateAdmin = async (request: Request) => {
  try {
    const session = await shopify.authenticate.admin(request);
    return session;
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Response("Unauthorized", { status: 401 });
  }
};

// Utility exports for other app functionalities
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const login = shopify.login;
export const sessionStorage = shopify.sessionStorage;
