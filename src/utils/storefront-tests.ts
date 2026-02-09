// Test file to validate storefront frontend integration
import { storefrontService } from '../services/storefront.service';

// Test service instantiation
const testService = () => {
  console.log('✅ Storefront service imported successfully');
  console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(storefrontService)));
};

// Test component imports
const testComponents = async () => {
  try {
    const { StorefrontManager } = await import('../components/storefront/store-setup-wizard');
    const { PricingManager } = await import('../components/storefront/pricing-manager');
    const { OrderManager } = await import('../components/storefront/order-manager');
    const { StorefrontSettings } = await import('../components/storefront/storefront-settings');
    
    console.log('✅ All storefront components imported successfully');
    console.log('Components:', { StorefrontManager, PricingManager, OrderManager, StorefrontSettings });
  } catch (error) {
    console.error('❌ Component import failed:', error);
  }
};

// Test page import
const testPage = async () => {
  try {
    const { StorefrontDashboardPage } = await import('../pages/agent/storefront-dashboard');
    console.log('✅ Storefront dashboard page imported successfully');
    console.log('Page component:', StorefrontDashboardPage);
  } catch (error) {
    console.error('❌ Page import failed:', error);
  }
};

// Run tests
export const runStorefrontTests = async () => {
  console.log('🧪 Running storefront frontend integration tests...\n');
  
  testService();
  await testComponents();
  await testPage();
  
  console.log('\n✅ All storefront frontend tests completed!');
  console.log('🏪 Agent storefront workflow is ready for testing');
};

// Auto-run in development
if (import.meta.env.DEV) {
  runStorefrontTests();
}