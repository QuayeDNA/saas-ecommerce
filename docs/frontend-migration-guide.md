# Frontend Migration Guide: Product/Variants → Package Groups/Items

This document outlines the changes made to update the frontend order management system from the legacy Product/Variants structure to the new Package Groups/Items structure.

## Summary of Changes

### 1. Updated Type Definitions

**File**: `src/types/order.ts`

**Before**:
```typescript
export interface OrderItem {
  product: string;
  variant: string;
  variantDetails: {
    name: string;
    sku: string;
    price: number;
    network?: string;
    bundleType?: string;
  };
  // ...
}

export interface CreateSingleOrderData {
  productId: string;
  variantId: string;
  // ...
}
```

**After**:
```typescript
export interface OrderItem {
  packageGroup: string;
  packageItem: string;
  packageDetails: {
    name: string;
    code: string;
    price: number;
    provider?: string;
  };
  // ...
}

export interface CreateSingleOrderData {
  packageGroupId: string;
  packageItemId: string;
  // ...
}
```

### 2. Updated Order Service Integration

**File**: `src/services/order.service.ts`

- Service already uses correct API endpoints (`/api/orders/*`)
- Updated to work with new field names in request/response data
- No changes needed to API calls as backend endpoints remain the same

### 3. Updated Create Order Modal

**File**: `src/components/orders/CreateOrderModal.tsx`

**Key Changes**:
- Changed from `useProduct()` to `usePackage()` hook
- Updated form fields from `productId/variantId` to `packageGroupId/packageItemId`
- Updated selection logic to work with Package Groups containing Package Items
- Updated form labels and display information

**Before**:
```tsx
const { products, fetchProducts } = useProduct();
const [formData, setFormData] = useState({
  productId: '',
  variantId: '',
  // ...
});
```

**After**:
```tsx
const { packages, fetchPackages } = usePackage();
const [formData, setFormData] = useState({
  packageGroupId: '',
  packageItemId: '',
  // ...
});
```

### 4. Updated Order Card Display

**File**: `src/components/orders/OrderCard.tsx`

**Changes**:
- Updated to display `item.packageDetails.provider` instead of `item.variantDetails.network`
- Updated to use package-specific terminology
- Maintained all existing functionality (processing, status display, etc.)

### 5. Updated Order Management Page

**File**: `src/pages/orders-page.tsx`

**Changes**:
- Added `PackageProvider` to provide package context to child components
- Wrapped existing `OrderProvider` with `PackageProvider`

```tsx
<OrderProvider>
  <PackageProvider>
    <OrderList />
  </PackageProvider>
</OrderProvider>
```

## Package Integration

### Package Context Usage

The frontend now uses the existing package management system:

- **Hook**: `usePackage()` from `src/hooks/use-package.ts`
- **Provider**: `PackageProvider` from `src/contexts/package-context-value.tsx`
- **Service**: `packageService` from `src/services/package.service.ts`
- **Types**: Package types from `src/types/package.ts`

### Package Data Structure

```typescript
interface PackageGroup {
  _id: string;
  name: string;
  provider: string; // 'MTN' | 'TELECEL' | 'AT' | 'GLO'
  packageItems: PackageItem[];
  // ...
}

interface PackageItem {
  _id: string;
  name: string;
  code: string;
  price: number;
  dataVolume: number; // in GB
  validity: number; // in days
  inventory: number;
  // ...
}
```

## API Alignment

### Backend API Endpoints

The backend now expects:

```typescript
// Single Order Creation
POST /api/orders/single
{
  "packageGroupId": "...",
  "packageItemId": "...",
  "customerPhone": "...",
  "quantity": 1
}

// Bulk Order Creation  
POST /api/orders/bulk
{
  "packageGroupId": "...",
  "packageItemId": "...",
  "rawInput": "phone:bundle\\nphone:bundle..."
}
```

### Response Structure

Orders now return:

```typescript
{
  "items": [{
    "packageGroup": "...",
    "packageItem": "...", 
    "packageDetails": {
      "name": "1GB Daily",
      "code": "MTN-1GB-DAILY",
      "price": 5.00,
      "dataVolume": 1,
      "validity": 1,
      "provider": "MTN"
    },
    // ...
  }]
}
```

## Testing the Integration

### 1. Order Creation Flow

1. **Navigate to Orders page** → Should load PackageProvider
2. **Click "Create Order"** → Should load available package groups
3. **Select Package Group** → Should populate package items dropdown
4. **Select Package Item** → Should show package details (price, data, validity, provider)
5. **Fill customer details** → Should validate phone number format
6. **Submit order** → Should create order with packageGroupId/packageItemId

### 2. Order Display

1. **View existing orders** → Should display package details instead of variant details
2. **Order item details** → Should show provider instead of network
3. **Process order items** → Should work with new field structure

### 3. Bulk Orders

1. **Create bulk order** → Should use same package selection
2. **Enter bulk data** → Should parse phone:bundle format
3. **Process bulk order** → Should handle multiple items correctly

## Backward Compatibility

### Database Migration

If there are existing orders in the database with the old structure, a migration script should be run:

```javascript
// Migration script example
db.orders.updateMany(
  { "items.product": { $exists: true } },
  { 
    $rename: { 
      "items.product": "items.packageGroup",
      "items.variant": "items.packageItem",
      "items.variantDetails": "items.packageDetails"
    }
  }
);

// Update field names in packageDetails
db.orders.updateMany(
  { "items.packageDetails.sku": { $exists: true } },
  { 
    $rename: { 
      "items.packageDetails.sku": "items.packageDetails.code",
      "items.packageDetails.network": "items.packageDetails.provider"
    }
  }
);
```

### Frontend Fallbacks

The frontend should handle both old and new data formats during transition:

```typescript
// Example fallback in OrderCard
const displayProvider = item.packageDetails?.provider || item.variantDetails?.network;
const displayCode = item.packageDetails?.code || item.variantDetails?.sku;
```

## Error Handling

### Common Issues and Solutions

1. **Package not found error**
   - Ensure packages are properly loaded before creating orders
   - Check package service authentication

2. **Missing packageItem in dropdown**
   - Verify package group selection triggers item loading
   - Check packageGroup.packageItems array structure

3. **Order creation fails**
   - Verify correct field names (packageGroupId, not productId)
   - Check API request structure matches backend expectations

### Debug Steps

1. **Check network requests** in browser DevTools
2. **Verify package data** is loaded correctly
3. **Test API endpoints** directly with correct payload
4. **Check authentication** tokens and permissions

## Benefits of Migration

1. **Improved Data Model**: More logical grouping of related packages
2. **Better Provider Management**: Direct provider association with packages
3. **Simplified Inventory**: Clearer inventory management per package item
4. **Enhanced UX**: Better package selection and organization
5. **Future-Proof**: Aligns with modern package management patterns

## Next Steps

1. **Test all order creation flows** thoroughly
2. **Verify order processing** works correctly
3. **Update any remaining Product/Variant references**
4. **Monitor for any API integration issues**
5. **Train users** on new package selection interface if needed

## Rollback Plan

If issues arise, the frontend can be quickly reverted by:

1. Reverting the type definitions in `src/types/order.ts`
2. Reverting the CreateOrderModal changes
3. Reverting the OrderCard changes
4. Removing PackageProvider from orders page
5. Switching back to useProduct() hook

The backend migration is more complex and should be tested thoroughly before deployment.
