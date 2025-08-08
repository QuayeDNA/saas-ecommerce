# Daily Spending Tracking Implementation (User-Specific)

## Overview

Implemented a user-specific daily spending tracking system that automatically resets every day and integrates with the order creation process to track real-time spending for each individual agent.

## Features

- **User-Specific Tracking**: Each logged-in agent has their own daily spending tracking
- **Daily Reset**: Spending amounts automatically reset at midnight each day for each user
- **Local Storage**: Spending data persists in browser's localStorage with user-specific keys
- **Real-time Updates**: Spending updates immediately when orders are created
- **Cross-component Communication**: Uses custom events to sync data across components

## Implementation Details

### 1. Daily Spending Hook (`use-daily-spending.ts`)
- Manages daily spending state with automatic daily reset
- Persists data to localStorage with date-based keys
- Listens for external updates via custom events
- Provides functions for updating, resetting, and clearing spending data

### 2. Order Context Integration (`OrderContext.tsx`)
- Added `updateDailySpending` helper function
- Integrated daily spending updates in `createSingleOrder` function
- Integrated daily spending updates in `createBulkOrder` function
- Uses custom events to communicate spending updates to the hook

### 3. UI Components Updated
- **Header Component**: Shows "Today's Spending" in wallet section for agents
- **Dashboard Component**: Displays daily spending in account overview stats

## How It Works

1. **Initialization**: Hook loads existing spending data or initializes with 0
2. **Order Creation**: When orders are successfully created (not drafts), the total amount is added to daily spending
3. **Event Communication**: OrderContext dispatches 'dailySpendingUpdated' events
4. **Hook Updates**: Daily spending hook listens for events and updates the display
5. **Daily Reset**: Each day at midnight, the system automatically resets to 0

## Testing

### Manual Testing Steps:
1. Open the application and log in as an agent
2. Check the "Today's Spending" amount in the header (should show ₦0.00 initially)
3. Create a single order or bulk order
4. Verify that "Today's Spending" updates immediately with the order total
5. Check the dashboard to see the same amount reflected there
6. Log out and log in as a different agent to verify user-specific tracking

## Data Structure

### LocalStorage Format:
```json
{
  "date": "2024-01-08",
  "amount": 1250.50
}
```

**Storage Keys:**
- Format: `dailySpending_{userId}`
- Example: `dailySpending_64f7b5e9c123456789abcdef`
- Anonymous: `dailySpending_anonymous`

### Custom Event:
- **Event Name**: `dailySpendingUpdated`
- **Trigger**: After successful order creation
- **Listener**: Daily spending hook

## Files Modified:
1. `src/hooks/use-daily-spending.ts` - Main hook implementation
2. `src/contexts/OrderContext.tsx` - Order integration
3. `src/components/header.tsx` - UI display
4. `src/pages/dashboard-page.tsx` - Dashboard display

## Future Enhancements:
1. Add error handling for localStorage failures
2. Implement backup storage mechanism
3. Add daily spending limits and warnings
4. Create spending history tracking
5. Add export functionality for daily reports
6. Add daily spending analytics and trends
