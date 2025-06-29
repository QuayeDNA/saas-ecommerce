import { useFieldArray } from 'react-hook-form';
import type { UseFieldArrayReturn, UseFormReturn, FieldValues } from 'react-hook-form';
import { Button, Input, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../design-system';
import { FaTrash, FaPlus } from 'react-icons/fa';

interface VariantFormProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
}

export const VariantForm = <T extends FieldValues = FieldValues>({ form }: VariantFormProps<T>) => {
  const { fields, append, remove }: UseFieldArrayReturn<T> = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Variants</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: '', price: 0, sku: '', inventory: 0 } as any)}
        >
          <FaPlus className="mr-2 h-4 w-4" /> Add Variant
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
          <FormField
            control={form.control}
            name={`variants.${index}.name` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variant Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter variant name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${index}.price` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${index}.sku` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Enter SKU" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`variants.${index}.inventory` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventory</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-end justify-end md:col-span-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="text-red-500"
            >
              <FaTrash className="mr-2 h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};