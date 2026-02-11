/**
 * Tutorial Registry
 *
 * Defines all interactive task-based tutorials available in the app.
 * Each tutorial is a series of steps that guide the user through a specific workflow.
 */

import type { ReactNode } from "react";

// --- Types ---

export interface TutorialStep {
  /** CSS selector for the element to spotlight (optional — null = center-screen overlay) */
  target?: string;
  /** Step title */
  title: string;
  /** Step body text (supports short markdown-like emphasis) */
  content: string;
  /** Tooltip placement relative to target */
  position?: "top" | "right" | "bottom" | "left";
  /** If set, the step waits for the user to perform this action before auto-advancing */
  waitForSelector?: string;
  /** Optional callback fired when this step becomes active */
  onEnter?: () => void;
  /** Icon node rendered in the step header */
  icon?: ReactNode;
  /** Whether this step is a "task" the user should complete (shows ✓ checkmark) */
  isTask?: boolean;
  /** Custom CTA text (default: "Next" / "Got it") */
  ctaText?: string;
}

export interface Tutorial {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Short description shown in the launcher menu */
  description: string;
  /** Category for grouping in the launcher */
  category: TutorialCategory;
  /** The route path that this tutorial is relevant to (used for auto-trigger) */
  targetRoutes: string[];
  /** Ordered steps */
  steps: TutorialStep[];
  /** Estimated minutes to complete */
  estimatedMinutes?: number;
  /** Minimum user roles that can see this tutorial (empty = all roles) */
  roles?: string[];
}

export type TutorialCategory =
  | "getting-started"
  | "ordering"
  | "storefront"
  | "wallet"
  | "commissions"
  | "admin";

export const CATEGORY_LABELS: Record<TutorialCategory, string> = {
  "getting-started": "Getting Started",
  ordering: "Ordering",
  storefront: "Storefront",
  wallet: "Wallet & Payments",
  commissions: "Commissions",
  admin: "Admin",
};

// --- Tutorial Definitions ---

const dashboardOverviewTutorial: Tutorial = {
  id: "dashboard-overview",
  title: "Your Dashboard",
  description: "Learn the main dashboard layout, quick actions, and key metrics.",
  category: "getting-started",
  targetRoutes: ["/dashboard"],
  estimatedMinutes: 2,
  steps: [
    {
      target: ".dashboard-welcome",
      title: "Welcome to Your Dashboard",
      content:
        "This is your command center. Here you can see quick stats, place orders, and monitor your business at a glance.",
      position: "bottom",
    },
    {
      target: ".quick-actions",
      title: "Quick Network Actions",
      content:
        "Tap any network card to start ordering airtime or data bundles. MTN, Telecel, AT — all available here.",
      position: "bottom",
      isTask: true,
      ctaText: "Got it",
    },
    {
      target: ".account-overview",
      title: "Your Performance Metrics",
      content:
        "Track total orders, spending, success rate, and wallet balance. These numbers update in real-time.",
      position: "bottom",
    },
    {
      target: ".wallet-balance",
      title: "Wallet Balance",
      content:
        "Orders are deducted from your wallet automatically. Keep it topped up so you never miss a sale! You can request a top-up anytime.",
      position: "right",
    },
    {
      target: ".recent-transactions",
      title: "Recent Activity",
      content:
        "Your latest transactions and order history appear here. Tap any transaction to see its details.",
      position: "top",
    },
  ],
};

const placeOrderTutorial: Tutorial = {
  id: "place-order",
  title: "How to Place an Order",
  description: "Step-by-step guide to purchasing airtime or data bundles.",
  category: "ordering",
  targetRoutes: ["/dashboard/orders", "/dashboard"],
  estimatedMinutes: 3,
  steps: [
    {
      title: "Placing an Order",
      content:
        "Let's walk through placing your first airtime or data order. You'll pick a network, choose a bundle, enter a phone number, and confirm.",
      position: "bottom",
    },
    {
      target: ".quick-actions",
      title: "Step 1: Choose a Network",
      content:
        "Click on one of the network tiles (MTN, Telecel, AT) to see available bundles for that provider.",
      position: "bottom",
      isTask: true,
      ctaText: "Next",
    },
    {
      title: "Step 2: Select a Bundle",
      content:
        "Browse the available packages and select the bundle you want to purchase. You'll see the price and data/airtime amount.",
    },
    {
      title: "Step 3: Enter Recipient Number",
      content:
        "Type in the phone number that should receive the airtime or data bundle. Double-check it before confirming!",
      isTask: true,
    },
    {
      title: "Step 4: Confirm & Pay",
      content:
        "Review your order details and confirm. The amount will be deducted from your wallet balance automatically.",
    },
    {
      title: "You're Ready!",
      content:
        "That's it! After placing an order, you'll see its status update in real-time on the Orders page. Most orders complete within seconds.",
      ctaText: "Finish",
    },
  ],
};

const storefrontSetupTutorial: Tutorial = {
  id: "storefront-setup",
  title: "Set Up Your Storefront",
  description: "Create a branded online store where customers can buy directly from you.",
  category: "storefront",
  targetRoutes: ["/dashboard/storefront"],
  estimatedMinutes: 4,
  roles: ["agent", "super_agent", "dealer", "super_dealer"],
  steps: [
    {
      title: "What's a Storefront?",
      content:
        "Your storefront is a public online shop where customers can browse your bundles and place orders. You earn profit through your custom pricing!",
    },
    {
      target: '[data-tour="storefront-settings"]',
      title: "Configure Your Store",
      content:
        "Head to Settings to add your business name, contact info, and payment methods. These details appear on your public store page.",
      position: "bottom",
      isTask: true,
      ctaText: "Next",
    },
    {
      target: '[data-tour="storefront-branding"]',
      title: "Brand Your Store",
      content:
        "Add a logo, banner, tagline, and choose a theme color. Pick a layout style — Classic, Modern, or Minimal — to match your brand.",
      position: "bottom",
      isTask: true,
    },
    {
      target: '[data-tour="storefront-pricing"]',
      title: "Set Your Prices",
      content:
        "Go to Pricing to add markups on bundles. The difference between your price and the tier price is your profit per sale.",
      position: "bottom",
      isTask: true,
    },
    {
      title: "Add Payment Methods",
      content:
        "Set up at least one payment method (Mobile Money or Bank Transfer) so customers know how to pay you.",
      isTask: true,
    },
    {
      title: "Share Your Store Link",
      content:
        "Once everything is set up, share your unique store URL with customers via WhatsApp, social media, or business cards. You're in business!",
      ctaText: "Finish",
    },
  ],
};

const storefrontOrdersTutorial: Tutorial = {
  id: "storefront-orders",
  title: "Managing Store Orders",
  description: "Learn how to confirm payments and fulfill customer orders from your storefront.",
  category: "storefront",
  targetRoutes: ["/dashboard/storefront"],
  estimatedMinutes: 3,
  roles: ["agent", "super_agent", "dealer", "super_dealer"],
  steps: [
    {
      title: "Storefront Orders",
      content:
        "When a customer places an order from your store, it appears here as 'Pending'. You need to confirm their payment before the order is fulfilled.",
    },
    {
      title: "Step 1: Review the Order",
      content:
        "Check the order details — customer name, phone number, items ordered, and total amount. Verify the payment reference they provided.",
      isTask: true,
    },
    {
      title: "Step 2: Verify Payment",
      content:
        "Check your Mobile Money or bank account to confirm the customer actually sent the payment. Match the amount and reference number.",
      isTask: true,
    },
    {
      title: "Step 3: Confirm & Fulfill",
      content:
        "Once payment is verified, click 'Confirm' to fulfill the order. The bundles will be delivered to the customer automatically.",
      isTask: true,
    },
    {
      title: "Order Complete!",
      content:
        "The customer receives their bundles and you earn your profit (the markup amount). Track all your earnings in the Overview tab.",
      ctaText: "Finish",
    },
  ],
};

const walletTutorial: Tutorial = {
  id: "wallet-management",
  title: "Manage Your Wallet",
  description: "Learn how to top up your wallet and track transactions.",
  category: "wallet",
  targetRoutes: ["/dashboard/wallet"],
  estimatedMinutes: 2,
  steps: [
    {
      target: ".wallet-balance",
      title: "Your Wallet",
      content:
        "Your wallet is used to pay for all orders. The balance updates in real-time as you place orders and receive top-ups.",
      position: "bottom",
    },
    {
      title: "Requesting a Top-Up",
      content:
        "To add funds, make a payment to your upline (super agent or dealer) and request a top-up. They'll credit your wallet once they verify the payment.",
      isTask: true,
    },
    {
      title: "Transaction History",
      content:
        "Every wallet activity — top-ups, debits, refunds — is logged here. Use this to reconcile your records and track your spending.",
    },
    {
      title: "Keeping Your Wallet Funded",
      content:
        "Pro tip: Top up before your balance runs low. Failed orders due to insufficient funds can mean lost sales!",
      ctaText: "Finish",
    },
  ],
};

const commissionsTutorial: Tutorial = {
  id: "commissions-overview",
  title: "Understanding Commissions",
  description: "Learn how the commission system works and track your earnings.",
  category: "commissions",
  targetRoutes: ["/dashboard/commissions"],
  estimatedMinutes: 2,
  roles: ["super_agent", "dealer", "super_dealer"],
  steps: [
    {
      title: "How Commissions Work",
      content:
        "You earn commissions when agents in your network make sales. The commission percentage depends on your tier and the product type.",
    },
    {
      title: "Daily Accumulation",
      content:
        "Commissions accumulate daily from your agents' transactions. You can see the running total on this page.",
    },
    {
      title: "Monthly Summaries",
      content:
        "At the end of each month, commissions are finalized and added to your wallet. Check the summary to see breakdowns by agent and product.",
    },
    {
      title: "Tracking Your Network",
      content:
        "More active agents = more commissions. Grow your network and support your agents to maximize earnings!",
      ctaText: "Finish",
    },
  ],
};

// --- Registry ---

export const TUTORIALS: Tutorial[] = [
  dashboardOverviewTutorial,
  placeOrderTutorial,
  storefrontSetupTutorial,
  storefrontOrdersTutorial,
  walletTutorial,
  commissionsTutorial,
];

/**
 * Get tutorials relevant to a specific route path.
 */
export const getTutorialsForRoute = (pathname: string): Tutorial[] => {
  return TUTORIALS.filter((t) =>
    t.targetRoutes.some((route) => pathname.startsWith(route)),
  );
};

/**
 * Get tutorials filtered by user role.
 */
export const getTutorialsForRole = (
  role: string,
  tutorials: Tutorial[] = TUTORIALS,
): Tutorial[] => {
  return tutorials.filter(
    (t) => !t.roles || t.roles.length === 0 || t.roles.includes(role),
  );
};

/**
 * Group tutorials by category.
 */
export const groupTutorialsByCategory = (
  tutorials: Tutorial[],
): Record<TutorialCategory, Tutorial[]> => {
  const grouped = {} as Record<TutorialCategory, Tutorial[]>;
  for (const t of tutorials) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  }
  return grouped;
};
