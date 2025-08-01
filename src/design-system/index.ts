/**
 * Design System Component Export File
 */

// Export all components from the design system
export { Button } from './components/button';
export { Badge } from './components/badge';
export { Card, CardHeader, CardBody, CardFooter } from './components/card';
export { Input } from './components/input';
export { Select } from './components/select';
export { Alert } from './components/alert';
export { ToastProvider, useToast } from './components/toast';
export { Table, TableHeader, TableBody, TableRow, TableCell } from './components/table';
export { Pagination } from './components/pagination';
export { StatCard, StatsGrid } from './components/stats-card';
export type { Toast, ToastType } from './components/toast';
export { Dropdown } from './components/dropdown';
export { Form } from './components/form';
export { FormField } from './components/form-field';
export { FormActions } from './components/form-actions';
export { Dialog } from './components/dialog';
export { DialogHeader } from './components/dialog-header';
export { DialogBody } from './components/dialog-body';
export { DialogFooter } from './components/dialog-footer';

// New components
export { Spinner } from './components/spinner';
export { Hero, HeroTitle, HeroSubtitle } from './components/hero';
export { Feature, FeatureGrid } from './components/feature';
export { Container } from './components/container';
export { Image, HeroImage } from './components/image';
export { Section, SectionHeader } from './components/section';
export { Testimonial, Avatar } from './components/testimonial';

// Export theme provider and types
export { ThemeProvider } from '../contexts/theme-context';
export type { ThemeColor } from '../contexts/theme-context-value';
