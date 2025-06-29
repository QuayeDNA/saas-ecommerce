import { useQuery } from '@tanstack/react-query';
import { Input, Table, TableBody, TableCell, TableHeader, TableRow, Button, useToast } from '../../design-system';
import { FaSave, FaSyncAlt } from 'react-icons/fa'; // Updated: use FaSyncAlt for refresh
// Update the path below to the actual location of your api service file, e.g.:
import { api } from '../../services/api.service';
import { useState } from 'react';

interface InventoryUpdate {
  productId: string;
  variantId: string;
  inventory: number;
}

export const InventoryManagement = () => {
  const toast = useToast();
  const [updates, setUpdates] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products', 'inventory'],
    queryFn: async () => {
      const response = await api.get('/api/products');
      return response.data.products;
    }
  });

  const handleInventoryChange = (productId: string, variantId: string, value: number) => {
    setUpdates(prev => ({
      ...prev,
      [`${productId}-${variantId}`]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatesArray = Object.entries(updates).map(([key, inventory]) => {
        const [productId, variantId] = key.split('-');
        return { productId, variantId, inventory };
      });

      await api.patch('/api/products/inventory/bulk', { updates: updatesArray });
      toast({ title: 'Success', description: 'Inventory updated successfully' });
      setUpdates({});
      refetch();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update inventory', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading inventory...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">Failed to load inventory</p>
        <Button onClick={() => refetch()} variant="outline">
          <FaSyncAlt className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Inventory Management</h2>
        <Button onClick={handleSave} disabled={isSaving || Object.keys(updates).length === 0}>
          <FaSave className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Current Inventory</TableHead>
              <TableHead>New Inventory</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.flatMap((product: any) => 
              product.variants.map((variant: any) => (
                <TableRow key={`${product._id}-${variant._id}`}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{variant.name}</TableCell>
                  <TableCell>{variant.inventory}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      defaultValue={variant.inventory}
                      onChange={(e) => 
                        handleInventoryChange(product._id, variant._id, parseInt(e.target.value))
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>