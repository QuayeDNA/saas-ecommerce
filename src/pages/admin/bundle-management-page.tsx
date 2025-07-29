import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bundleService } from '../../services/bundle.service';
import { packageService } from '../../services/package.service';
import type { Bundle, Package } from '../../types/package';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const defaultBundle = {
  name: '',
  description: '',
  dataVolume: 0,
  dataUnit: 'MB' as const,
  validity: 1,
  validityUnit: 'days' as const,
  price: 0,
  currency: 'GHS' as const,
  features: [] as string[],
  isActive: true,
  tags: [] as string[],
  packageId: '',
  providerId: '',
};

export const BundleManagementPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formBundle, setFormBundle] = useState<Bundle | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  useEffect(() => {
    if (!packageId) return;
    setLoading(true);
    setError(null);
    bundleService.getBundlesByPackage(packageId, { page: pagination.page, limit: pagination.limit })
      .then(resp => {
        setBundles(resp.bundles || []);
        setPagination(prev => ({ ...prev, total: resp.pagination.total, pages: resp.pagination.pages }));
      })
      .catch(e => setError(e.message || 'Failed to fetch bundles'))
      .finally(() => setLoading(false));
    packageService.getPackage(packageId).then(setPkg).catch(() => {});
  }, [packageId, pagination.limit, pagination.page, showForm]);

  const handleAdd = () => {
    setFormBundle({
      ...defaultBundle,
      packageId: packageId || '',
      providerId: pkg?.provider || '',
      tenantId: '', // Provide default or fetch as needed
      createdBy: '', // Provide default or fetch as needed
      isDeleted: false, // Default to false for new bundle
    });
    setShowForm(true);
  };
  const handleEdit = (bundle: Bundle) => {
    setFormBundle(bundle);
    setShowForm(true);
  };
  const handleDelete = async (bundle: Bundle) => {
    if (!window.confirm(`Delete bundle "${bundle.name}"?`)) return;
    setFormLoading(true);
    setFormError(null);
    try {
      await bundleService.deleteBundle(bundle._id!);
      setBundles(bundles.filter(b => b._id !== bundle._id));
    } catch (e) {
      if (e instanceof Error) {
        setFormError(e.message || 'Failed to delete bundle');
      } else {
        setFormError('Failed to delete bundle');
      }
    } finally {
      setFormLoading(false);
    }
  };
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBundle) return;
    setFormLoading(true);
    setFormError(null);
    try {
      if (formBundle._id) {
        await bundleService.updateBundle(formBundle._id, formBundle);
      } else {
        await bundleService.createBundle(formBundle);
      }
      setShowForm(false);
    } catch (e) {
      if (e instanceof Error) {
        setFormError(e.message || 'Failed to save bundle');
      } else {
        setFormError('Failed to save bundle');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  return (
    <div className="p-8 space-y-6">
      <button className="mb-4 text-blue-600" onClick={() => navigate(-1)}>&larr; Back</button>
      <h2 className="text-2xl font-bold">Manage Bundles for: {pkg?.name}</h2>
      <div className="mb-4 text-gray-600">{pkg?.description}</div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Bundles</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2" onClick={handleAdd}><FaPlus /> Add Bundle</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bundles.map(bundle => (
                <tr key={bundle._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{bundle.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bundle.dataVolume} {bundle.dataUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bundle.validity} {bundle.validityUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bundle.price} {bundle.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bundle.isActive ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button className="text-blue-600" onClick={() => handleEdit(bundle)}><FaEdit /></button>
                    <button className="text-red-600" onClick={() => handleDelete(bundle)} disabled={formLoading}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination (unchanged) */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Add/Edit Bundle Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4 relative" onSubmit={handleFormSubmit}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowForm(false)} aria-label="Close">&times;</button>
            <h4 className="text-lg font-bold mb-2">{formBundle?._id ? 'Edit Bundle' : 'Add Bundle'}</h4>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className="w-full border rounded px-3 py-2" required value={formBundle?.name || ''} onChange={e => setFormBundle(fb => ({ ...fb!, name: e.target.value } as Bundle))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="w-full border rounded px-3 py-2" value={formBundle?.description || ''} onChange={e => setFormBundle(fb => ({ ...fb!, description: e.target.value } as Bundle))} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Data Volume</label>
                <input type="number" className="w-full border rounded px-3 py-2" required value={formBundle?.dataVolume || ''} onChange={e => setFormBundle(fb => ({ ...fb!, dataVolume: +e.target.value } as Bundle))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select className="w-full border rounded px-3 py-2" value={formBundle?.dataUnit || 'MB'} onChange={e => setFormBundle(fb => ({ ...fb!, dataUnit: e.target.value as Bundle['dataUnit'] } as Bundle))}>
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Validity</label>
                <input type="number" className="w-full border rounded px-3 py-2" required value={formBundle?.validity || ''} onChange={e => setFormBundle(fb => ({ ...fb!, validity: +e.target.value } as Bundle))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Validity Unit</label>
                <select className="w-full border rounded px-3 py-2" value={formBundle?.validityUnit || 'days'} onChange={e => setFormBundle(fb => ({ ...fb!, validityUnit: e.target.value as Bundle['validityUnit'] } as Bundle))}>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Price</label>
                <input type="number" className="w-full border rounded px-3 py-2" required value={formBundle?.price || ''} onChange={e => setFormBundle(fb => ({ ...fb!, price: +e.target.value } as Bundle))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <input className="w-full border rounded px-3 py-2" value={formBundle?.currency || 'GHS'} onChange={e => setFormBundle(fb => ({ ...fb!, currency: e.target.value as Bundle['currency'] } as Bundle))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Active</label>
              <input type="checkbox" checked={!!formBundle?.isActive} onChange={e => setFormBundle(fb => ({ ...fb!, isActive: e.target.checked } as Bundle))} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowForm(false)} disabled={formLoading}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save'}</button>
            </div>
            {formError && <div className="text-red-600 text-sm mt-2">{formError}</div>}
          </form>
        </div>
      )}
    </div>
  );
};

export default BundleManagementPage; 