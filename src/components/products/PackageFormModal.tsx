// src/components/products/PackageFormModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaPlus, 
  FaTrash, 
  FaBox, 
  FaTag, 
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaUpload,
  FaDownload,
  FaFileExcel
} from 'react-icons/fa';
import type { PackageGroup, PackageItem, Provider } from '../../types/package';
import { providerService } from '../../services/provider.service';

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<PackageGroup>) => Promise<void>;
  package?: PackageGroup | null;
  mode: 'create' | 'edit';
  loading: boolean;
}

export const PackageFormModal: React.FC<PackageFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  package: packageData,
  mode,
  loading
}) => {
  const [formData, setFormData] = useState<Partial<PackageGroup>>({
    name: '',
    description: '',
    provider: '',
    tags: [],
    isActive: true,
    packageItems: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [newTag, setNewTag] = useState('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [bulkImportData, setBulkImportData] = useState<Partial<PackageItem>[]>([]);
  const [newItem, setNewItem] = useState<Partial<PackageItem>>({
    name: '',
    code: '',
    price: 0,
    dataVolume: 0,
    validity: 1,
    inventory: 0,
    reservedInventory: 0,
    lowStockThreshold: 10,
    isActive: true
  });

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Package details' },
    { id: 2, title: 'Data Items', description: 'Add bundle options' },
    { id: 3, title: 'Review', description: 'Confirm details' }
  ];

  useEffect(() => {
    if (packageData && mode === 'edit') {
      setFormData(packageData);
    } else {
      setFormData({
        name: '',
        description: '',
        provider: '',
        tags: [],
        isActive: true,
        packageItems: []
      });
    }
    setCurrentStep(1);
  }, [packageData, mode, isOpen]);

  // Fetch providers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);
      const providersResponse = await providerService.getPublicProviders();
      setProviders(providersResponse.providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
      // Fallback to static providers if API fails
      setProviders([
        { 
          _id: '1', 
          name: 'MTN Ghana', 
          code: 'MTN' as const,
          isActive: true,
          createdBy: '',
          isDeleted: false,
          salesCount: 0,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { 
          _id: '2', 
          name: 'Telecel Ghana', 
          code: 'TELECEL' as const,
          isActive: true,
          createdBy: '',
          isDeleted: false,
          salesCount: 0,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { 
          _id: '3', 
          name: 'AirtelTigo', 
          code: 'AT' as const,
          isActive: true,
          createdBy: '',
          isDeleted: false,
          salesCount: 0,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting package:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addPackageItem = () => {
    if (newItem.name && newItem.code && newItem.price && newItem.dataVolume) {
      setFormData(prev => ({
        ...prev,
        packageItems: [...(prev.packageItems || []), { ...newItem } as PackageItem]
      }));
      setNewItem({
        name: '',
        code: '',
        price: 0,
        dataVolume: 0,
        validity: 1,
        inventory: 0,
        reservedInventory: 0,
        lowStockThreshold: 10,
        isActive: true
      });
      setShowItemForm(false);
    }
  };

  const removePackageItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      packageItems: prev.packageItems?.filter((_, i) => i !== index) || []
    }));
  };

  // Bulk import functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBulkImportFile(file);
      parseBulkImportFile(file);
    }
  };

  const parseBulkImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('File must contain at least a header row and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const items: Partial<PackageItem>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const item: Partial<PackageItem> = {
          isActive: true,
          reservedInventory: 0,
          lowStockThreshold: 10
        };

        headers.forEach((header, index) => {
          const value = values[index];
          
          switch (header) {
            case 'name':
            case 'bundle_name':
              item.name = value;
              break;
            case 'code':
            case 'bundle_code':
              item.code = value;
              break;
            case 'price':
              item.price = parseFloat(value) || 0;
              break;
            case 'data_volume':
            case 'datavolume':
            case 'data':
              item.dataVolume = parseFloat(value) || 0;
              break;
            case 'validity':
            case 'validity_days':
              item.validity = parseInt(value) || 1;
              break;
            case 'inventory':
            case 'stock':
              item.inventory = parseInt(value) || 0;
              break;
            case 'low_stock_threshold':
            case 'threshold':
              item.lowStockThreshold = parseInt(value) || 10;
              break;
          }
        });

        if (item.name && item.code && item.price && item.dataVolume) {
          items.push(item);
        }
      }

      setBulkImportData(items);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the format.');
    }
  };

  const addBulkImportItems = () => {
    setFormData(prev => ({
      ...prev,
      packageItems: [...(prev.packageItems || []), ...bulkImportData as PackageItem[]]
    }));
    setBulkImportData([]);
    setBulkImportFile(null);
    setShowBulkImport(false);
    
    // Reset file input
    const fileInput = document.getElementById('bulk-import-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const downloadTemplate = () => {
    const headers = ['name', 'code', 'price', 'data_volume', 'validity', 'inventory', 'low_stock_threshold'];
    const sampleData = ['1GB Daily Bundle', 'MTN1GB24H', '5.00', '1.0', '1', '100', '10'];
    
    const csvContent = `${headers.join(',')}\n${sampleData.join(',')}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'package-items-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const canProceedToStep2 = formData.name && formData.provider;
  const canProceedToStep3 = canProceedToStep2 && (formData.packageItems?.length || 0) > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBox className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {mode === 'create' ? 'Create Package' : 'Edit Package'}
                </h2>
                <p className="text-sm text-gray-600">
                  {steps.find(s => s.id === currentStep)?.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-4 px-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                  <span className="text-xs text-gray-600 mt-1 hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Content - scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-6">{/* Extra bottom padding on mobile for fixed footer */}
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Package Setup</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Start by giving your package a name and selecting the network provider.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor='package-name' className="block text-sm font-medium text-gray-700 mb-2">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., MTN Data Bundles, Vodafone Weekly Plans"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Choose a descriptive name that customers will easily recognize
                    </p>
                  </div>

                  <div>
                    <label htmlFor='package-provider' className="block text-sm font-medium text-gray-700 mb-2">
                      Network Provider *
                    </label>
                    <select
                      value={formData.provider ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loadingProviders}
                    >
                      <option value="">
                        {loadingProviders ? 'Loading providers...' : 'Select the network provider'}
                      </option>
                      {providers.map((provider) => (
                        <option key={provider._id} value={provider.code}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      This determines which network the data bundles will work on
                    </p>
                  </div>

                  <div>
                    <label htmlFor='package-description' className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what makes this package special..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaTag className="inline mr-1" />
                      Tags (Optional)
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tags like 'daily', 'weekly', 'unlimited'..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-blue-600 hover:text-blue-800 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Package Items */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Add Data Bundles</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Create different data bundle options with various sizes and prices.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add New Item Button */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowItemForm(!showItemForm)}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <FaPlus className="text-gray-400" />
                    <span className="text-gray-600 font-medium">Add New Bundle</span>
                    {showItemForm ? <FaChevronUp /> : <FaChevronDown />}
                  </button>

                  {/* Bulk Import Button */}
                  <button
                    type="button"
                    onClick={() => setShowBulkImport(!showBulkImport)}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-green-300 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                  >
                    <FaUpload className="text-green-600" />
                    <span className="text-green-700 font-medium">Bulk Import from CSV</span>
                    {showBulkImport ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                {/* Add Item Form */}
                {showItemForm && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                    <h4 className="font-medium text-gray-900">New Bundle Details</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor='bundle-name' className="block text-sm font-medium text-gray-700 mb-1">
                          Bundle Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 1GB Daily Bundle"
                          value={newItem.name ?? ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor='bundle-code' className="block text-sm font-medium text-gray-700 mb-1">
                          Bundle Code *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., MTN1GB24H"
                          value={newItem.code ?? ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, code: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor='bundle-price' className="block text-sm font-medium text-gray-700 mb-1">
                          Price (GHS) *
                        </label>
                        <input
                          type="number"
                          placeholder="5.00"
                          value={newItem.price ?? ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor='bundle-data-size' className="block text-sm font-medium text-gray-700 mb-1">
                          Data Size (GB) *
                        </label>
                        <input
                          type="number"
                          placeholder="1.0"
                          value={newItem.dataVolume ?? ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, dataVolume: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.1"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor='bundle-validity' className="block text-sm font-medium text-gray-700 mb-1">
                          Validity (Days) *
                        </label>
                        <input
                          type="number"
                          placeholder="1"
                          value={newItem.validity || ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, validity: parseInt(e.target.value) ?? 1 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor='bundle-initial-stock' className="block text-sm font-medium text-gray-700 mb-1">
                          Initial Stock
                        </label>
                        <input
                          type="number"
                          placeholder="100"
                          value={newItem.inventory ?? ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">How many bundles you have available</p>
                      </div>
                      
                      <div>
                        <label htmlFor='bundle-low-stock' className="block text-sm font-medium text-gray-700 mb-1">
                          Low Stock Alert
                        </label>
                        <input
                          type="number"
                          placeholder="10"
                          value={newItem.lowStockThreshold ?? ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 10 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Alert when stock reaches this level</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowItemForm(false)}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addPackageItem}
                        disabled={!newItem.name || !newItem.code || !newItem.price || !newItem.dataVolume}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Add Bundle
                      </button>
                    </div>
                  </div>
                )}

                {/* Bulk Import Form */}
                {showBulkImport && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-green-900">Bulk Import Bundle Items</h4>
                      <button
                        type="button"
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FaDownload size={12} />
                        Template
                      </button>
                    </div>

                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-sm text-gray-600 mb-3">
                        Upload a CSV file with the following columns: name, code, price, data_volume, validity, inventory, low_stock_threshold
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          id="bulk-import-file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {bulkImportFile && (
                          <FaFileExcel className="text-green-600" size={20} />
                        )}
                      </div>
                    </div>

                    {bulkImportData.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">
                            Imported Items ({bulkImportData.length})
                          </h5>
                          <button
                            type="button"
                            onClick={addBulkImportItems}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Add All Items
                          </button>
                        </div>
                        
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {bulkImportData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">{item.name}</span>
                                <span className="text-gray-500 text-sm ml-2">({item.code})</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">GHS {item.price?.toFixed(2)}</div>
                                <div className="text-sm text-gray-500">{item.dataVolume}GB • {item.validity} days</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowBulkImport(false);
                          setBulkImportData([]);
                          setBulkImportFile(null);
                          const fileInput = document.getElementById('bulk-import-file') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Items */}
                <div className="space-y-3">
                  {formData.packageItems?.map((item, index) => (
                    <div key={`${item.code}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-600">Code: {item.code}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePackageItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="bg-blue-50 p-2 rounded">
                          <span className="text-blue-600 font-medium">GHS {item.price.toFixed(2)}</span>
                          <p className="text-blue-700 text-xs">Price</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <span className="text-green-600 font-medium">{item.dataVolume}GB</span>
                          <p className="text-green-700 text-xs">Data</p>
                        </div>
                        <div className="bg-orange-50 p-2 rounded">
                          <span className="text-orange-600 font-medium">{item.validity} days</span>
                          <p className="text-orange-700 text-xs">Validity</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <span className="text-purple-600 font-medium">{item.inventory}</span>
                          <p className="text-purple-700 text-xs">Stock</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.packageItems?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FaBox className="mx-auto text-4xl mb-2 text-gray-300" />
                    <p>No bundles added yet</p>
                    <p className="text-sm">Click "Add New Bundle" to get started</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Review Your Package</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Double-check all details before creating your package.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Package Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="text-gray-900 font-medium ml-2">{formData.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Provider:</span>
                        <span className="text-gray-900 font-medium ml-2">{formData.provider}</span>
                      </div>
                      {formData.description && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">Description:</span>
                          <p className="text-gray-900 mt-1">{formData.description}</p>
                        </div>
                      )}
                      {formData.tags && formData.tags.length > 0 && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formData.tags.map((tag, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Bundles ({formData.packageItems?.length ?? 0})
                    </h4>
                    <div className="space-y-2">
                      {formData.packageItems?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <span className="text-gray-500 text-sm ml-2">({item.code})</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">GHS {item.price.toFixed(2)}</div>
                            <div className="text-sm text-gray-500">{item.dataVolume}GB • {item.validity} days</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Make this package active and available for sale
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions - Fixed on mobile */}
          <div className="border-t border-gray-200 p-4 sm:p-6 bg-white flex-shrink-0 fixed sm:relative bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-auto">
            <div className="flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && !canProceedToStep2) ||
                    (currentStep === 2 && !canProceedToStep3)
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : mode === 'create' ? 'Create Package' : 'Update Package'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
