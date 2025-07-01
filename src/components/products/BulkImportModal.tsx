// src/components/products/BulkImportModal.tsx
import React, { useState } from 'react';
import { 
  FaTimes, 
  FaUpload, 
  FaDownload, 
  FaCheck, 
  FaExclamationTriangle,
  FaSpinner,
  FaFileImport
} from 'react-icons/fa';
import { useProduct } from '../../contexts/ProductContext';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ValidationError {
    index: number;
    productName: string;
    errors: string[];
  }
  
  interface ValidationResult {
    totalProducts: number;
    errors: ValidationError[];
    valid: boolean;
  }

  interface ImportFailure {
    index: number;
    originalData: unknown;
    error: string;
  }
  
  interface ImportResult {
    successful: Record<string, unknown>[];
    failed: ImportFailure[];
  }

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { bulkCreateProducts, loading } = useProduct();
  
  const [step, setStep] = useState<'upload' | 'validate' | 'confirm' | 'result'>('upload');
  const [csvData, setCsvData] = useState('');
  
  
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
        validateData(content);
      };
      reader.readAsText(file);
    }
  };

  const validateData = async (data: string) => {
    try {
      setStep('validate');
      const response = await fetch('/api/products/bulk/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ csvData: data })
      });
      
      const result = await response.json();
      setValidationResult(result);
      setStep('confirm');
    } catch (error) {
      console.error('Validation failed:', error);
      setStep('upload');
    }
  };

  const handleImport = async () => {
    try {
      setStep('result');
      const result = await bulkCreateProducts({ csvData });
      // Ensure originalData is typed as Record<string, unknown>
      setImportResult({
        successful: result.successful,
        failed: result.failed.map((failure: ImportFailure) => ({
          ...failure,
          originalData: (typeof failure.originalData === 'object' && failure.originalData !== null)
            ? failure.originalData
            : {}
        }))
      });
    } catch (error) {
      console.error('Import failed:', error);
      setStep('confirm');
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/products/bulk/template', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-import-template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setCsvData('');
    setValidationResult(null);
    setImportResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaFileImport className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bulk Import Products
              </h2>
              <p className="text-gray-600">Import multiple products from CSV</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload CSV File
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Select a CSV file containing your product data
                  </p>
                  
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <FaUpload size={16} />
                    Choose File
                  </label>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Don't have a CSV file? Download our template to get started.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaDownload size={16} />
                  Download Template
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Validating */}
          {step === 'validate' && (
            <div className="text-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Validating Data
              </h3>
              <p className="text-gray-600">
                Please wait while we validate your CSV data...
              </p>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && validationResult && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Validation Results</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Total Products:</span>
                    <span className="font-medium ml-2">{validationResult.totalProducts}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Valid:</span>
                    <span className="font-medium ml-2 text-green-600">
                      {validationResult.totalProducts - validationResult.errors.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Errors:</span>
                    <span className="font-medium ml-2 text-red-600">
                      {validationResult.errors.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span>
                    <span className={`font-medium ml-2 ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                      {validationResult.valid ? 'Ready to Import' : 'Has Errors'}
                    </span>
                  </div>
                </div>
              </div>

              {validationResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                    <FaExclamationTriangle />
                    Validation Errors
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {validationResult.errors.map((error: ValidationError, index: number) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-red-800">
                          {error.productName} (Row {error.index + 2}):
                        </div>
                        <ul className="list-disc list-inside text-red-700 ml-4">
                          {error.errors.map((err: string, errIndex: number) => (
                            <li key={errIndex}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                
                <button
                  onClick={handleImport}
                  disabled={!validationResult.valid || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Importing...' : `Import ${validationResult.totalProducts - validationResult.errors.length} Products`}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 'result' && importResult && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  importResult.failed.length === 0 ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {importResult.failed.length === 0 ? (
                    <FaCheck className="text-green-600 text-2xl" />
                  ) : (
                    <FaExclamationTriangle className="text-orange-600 text-2xl" />
                  )}
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Import Complete
                </h3>
                <p className="text-gray-600">
                  {importResult.successful.length} products imported successfully
                  {importResult.failed.length > 0 && `, ${importResult.failed.length} failed`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.successful.length}
                  </div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {importResult.failed.length}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
              </div>

              {importResult.failed.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-3">Failed Imports</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {importResult.failed.map((failure: ImportFailure, index: number) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-red-800">
                          Row {failure.index + 2}: {((failure.originalData as Record<string, unknown>)?.name as string) || 'Unknown Product'}
                        </div>
                        <div className="text-red-700 ml-4">{failure.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => {
                    resetModal();
                    onClose();
                    onSuccess();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
