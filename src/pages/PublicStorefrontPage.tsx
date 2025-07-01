// src/pages/PublicStorefrontPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  HiSearch, 
  HiShoppingBag, 
  HiPhone, 
  HiMail,
  HiLocationMarker,
  HiHeart,
  HiShare,
  HiFilter,
  HiViewGrid,
  HiViewList,
  HiChevronDown,
  HiX,
  HiMenu,
  HiSparkles
} from 'react-icons/hi';
import { 
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaTelegram,
  FaGlobe
} from 'react-icons/fa';
import { storefrontService } from '../services/storefront.service';
import type { Storefront, StorefrontProductFilters } from '../types/storefront';
import type { Product, ProductVariant } from '../types/products';
import { PublicProductCard } from '../components/store/PublicProductCard';
import { OrderModal } from '../components/store/OrderModal';

export const PublicStorefrontPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StorefrontProductFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  interface SelectedProduct {
    product: Product;
    variant: ProductVariant;
    quantity: number;
  }
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const fetchStorefront = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await storefrontService.getPublicStorefront(slug!);
      setStorefront(data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message ?? 'Storefront not found');
      } else {
        setError('Storefront not found');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchStorefront();
    }
  }, [fetchStorefront, slug]);

  const fetchProducts = React.useCallback(async () => {
    if (!storefront) return;
    
    try {
      const { products: productData } = await storefrontService.getStorefrontProducts(
        storefront.slug,
        filters
      );
      setProducts(productData);
    } catch (err: unknown) {
      console.error('Failed to fetch products:', err);
    }
  }, [storefront, filters]);

  useEffect(() => {
    if (storefront) {
      fetchProducts();
    }
  }, [storefront, filters, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm });
  };

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    setSelectedProducts(prev => [...prev, { product, variant, quantity: 1 }]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-4"></div>
            <HiSparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-xl animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your store...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !storefront) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiX className="text-red-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Store Not Found</h1>
          <p className="text-gray-600 mb-6">{error ?? 'The requested store could not be found.'}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const themeStyles = {
    '--primary-color': storefront.theme.primaryColor,
    '--secondary-color': storefront.theme.secondaryColor,
    '--accent-color': storefront.theme.accentColor,
    '--background-color': storefront.theme.backgroundColor,
    '--text-color': storefront.theme.textColor,
  } as React.CSSProperties;

  const socialIcons = {
    whatsapp: FaWhatsapp,
    facebook: FaFacebook,
    twitter: FaTwitter,
    instagram: FaInstagram,
    telegram: FaTelegram,
    website: FaGlobe,
  };

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        backgroundColor: storefront.theme.backgroundColor,
        color: storefront.theme.textColor,
        fontFamily: storefront.theme.fontFamily,
        ...themeStyles
      }}
    >
      {/* Fixed Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Store Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {storefront.logo && (
                <div className="relative">
                  <img 
                    src={storefront.logo} 
                    alt={storefront.name}
                    className="h-10 w-10 rounded-xl object-cover shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold truncate" style={{ color: storefront.theme.primaryColor }}>
                  {storefront.name}
                </h1>
                {storefront.description && (
                  <p className="text-xs text-gray-500 truncate hidden sm:block">{storefront.description}</p>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Share Button */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: storefront.name,
                      text: storefront.description || '',
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiShare size={18} />
              </button>

              {/* Cart Button */}
              {storefront.features.allowOrders && (
                <button
                  onClick={() => setShowOrderModal(true)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-all hover:scale-105 shadow-lg"
                  style={{ backgroundColor: storefront.theme.accentColor }}
                >
                  <HiShoppingBag size={18} />
                  <span className="hidden sm:inline font-medium">Cart</span>
                  {selectedProducts.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                      {selectedProducts.length}
                    </span>
                  )}
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
              >
                <HiMenu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Announcement Banner */}
      {storefront.announcement.isActive && storefront.announcement.text && (
        <div className={`relative overflow-hidden ${
          storefront.announcement.type === 'info' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
          storefront.announcement.type === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
          storefront.announcement.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
          'bg-gradient-to-r from-red-500 to-pink-600 text-white'
        }`}>
          <div className="px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <HiSparkles className="text-sm animate-pulse" />
              <p className="text-sm font-medium">{storefront.announcement.text}</p>
              <HiSparkles className="text-sm animate-pulse" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        </div>
      )}

      {/* Hero Banner */}
      {storefront.banner && (
        <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
          <img 
            src={storefront.banner}
            alt={storefront.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute inset-0 flex items-end pb-8 px-4">
            <div className="max-w-7xl mx-auto w-full">
              <div className="text-white">
                <h2 className="text-2xl sm:text-4xl font-bold mb-2 drop-shadow-lg">
                  {storefront.name}
                </h2>
                {storefront.description && (
                  <p className="text-lg opacity-90 max-w-2xl drop-shadow">
                    {storefront.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Search and Filters */}
        {storefront.features.enableSearch && (
          <div className="mb-8">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative group">
                <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-700 bg-white shadow-sm hover:shadow-md"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 text-white rounded-xl transition-all hover:scale-105 shadow-md"
                  style={{ backgroundColor: storefront.theme.primaryColor }}
                >
                  Search
                </button>
              </div>
            </form>

            {/* Filter and View Controls */}
            <div className="flex items-center justify-between mt-6 px-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <HiFilter size={16} />
                  <span className="text-sm font-medium">Filters</span>
                  <HiChevronDown className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <HiViewGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <HiViewList size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: storefront.theme.primaryColor }}>
              <HiSparkles className="text-yellow-500" />
              Our Products
            </h2>
            <div className="text-sm text-gray-500">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </div>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiShoppingBag className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're working hard to bring you amazing products. Check back soon!
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <PublicProductCard
                  key={product._id}
                  product={product}
                  storefront={storefront}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <HiPhone className="text-blue-200" />
              Get in Touch
            </h3>
            <p className="text-blue-100">We'd love to hear from you!</p>
          </div>
          
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                {storefront.contactInfo.email && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <HiMail className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <a 
                        href={`mailto:${storefront.contactInfo.email}`}
                        className="font-semibold hover:underline"
                        style={{ color: storefront.theme.primaryColor }}
                      >
                        {storefront.contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {storefront.contactInfo.phone && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <HiPhone className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                      <a 
                        href={`tel:${storefront.contactInfo.phone}`}
                        className="font-semibold hover:underline"
                        style={{ color: storefront.theme.primaryColor }}
                      >
                        {storefront.contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {storefront.contactInfo.address && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <HiLocationMarker className="text-purple-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Address</p>
                      <p className="text-gray-700">{storefront.contactInfo.address}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Social Links */}
              {storefront.contactInfo.socialLinks && (
                <div>
                  <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <HiHeart className="text-red-500" />
                    Follow Us
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(storefront.contactInfo.socialLinks)
                      .filter(([url]) => url)
                      .map(([platform, url]) => {
                        const Icon = socialIcons[platform as keyof typeof socialIcons];
                        if (!Icon) return null;
                        
                        return (
                          <a 
                            key={platform}
                            href={platform === 'whatsapp' ? `https://wa.me/${url}` : url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 group"
                          >
                            <Icon 
                              size={24} 
                              className="group-hover:scale-110 transition-transform"
                              style={{ color: storefront.theme.accentColor }}
                            />
                            <span className="font-medium text-gray-700 capitalize text-sm">
                              {platform}
                            </span>
                          </a>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <OrderModal
          storefront={storefront}
          selectedProducts={selectedProducts}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => {
            setSelectedProducts([]);
            setShowOrderModal(false);
          }}
        />
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Menu</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <HiX size={20} />
                </button>
              </div>
              {/* Add mobile menu items here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};