import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast, Button, Dialog, DialogBody, DialogHeader, Input } from '../../design-system/';
import { api } from '../../services/api.service';
import { Product } from '../../types/products';
import { VariantForm } from './VariantForm';

const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['data-bundle', 'voice-bundle', 'sms-bundle', 'combo-bundle', 'physical', 'digital', 'service']),
  provider: z.string().optional(),
  description: z.string().optional(),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    price: z.number().min(0, 'Price must be positive'),
    sku: z.string().min(3, 'SKU must be at least 3 characters'),
    inventory: z.number().min(0).optional(),
  })).min(1, 'At least one variant is required'),
  isActive: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

export const ProductForm = ({ open, onOpenChange, product, onSuccess }: ProductFormProps) => {
  const { toast } = useToast();
  const defaultValues: Partial<ProductFormValues> = {
    name: product?.name || '',
    category: product?.category || 'physical',
    provider: product?.provider || '',
    description: product?.description || '',
    variants: product?.variants || [{ name: 'Default', price: 0, sku: '', inventory: 0 }],
    isActive: product?.isActive ?? true,
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (product) {
        await api.put(`/api/products/${product._id}`, data);
        toast({ title: 'Success', description: 'Product updated successfully' });
      } else {
        await api.post('/api/products', data);
        toast({ title: 'Success', description: 'Product created successfully' });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBody className="sm:max-w-3xl">
        <DialogHeader>
          <DialogHeader>{product ? 'Edit Product' : 'Create Product'}</DialogHeader>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="data-bundle">Data Bundle</SelectItem>
                        <SelectItem value="voice-bundle">Voice Bundle</SelectItem>
                        <SelectItem value="sms-bundle">SMS Bundle</SelectItem>
                        <SelectItem value="combo-bundle">Combo Bundle</SelectItem>
                        <SelectItem value="physical">Physical Product</SelectItem>
                        <SelectItem value="digital">Digital Product</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {['data-bundle', 'voice-bundle', 'sms-bundle', 'combo-bundle'].includes(form.watch('category')) && (
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MTN">MTN</SelectItem>
                          <SelectItem value="Vodafone">Vodafone</SelectItem>
                          <SelectItem value="AirtelTigo">AirtelTigo</SelectItem>
                          <SelectItem value="Glo">Glo</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <VariantForm form={form} />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogBody>
    </Dialog>
  );
};