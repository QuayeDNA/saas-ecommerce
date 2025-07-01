    // src/components/examples/button-examples.tsx
import React from 'react';
import { Button } from '../../design-system';
import { 
  Plus, Search, User, Settings, ArrowRight, ChevronRight, 
  Mail, Download, Upload, Trash, Check, X, Edit, Save 
} from 'lucide-react';
import { FaGoogle, FaFacebook, FaTwitter, FaApple } from 'react-icons/fa';

export const ButtonExamples: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-lg font-medium mb-4">Icon-Only Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button iconOnly leftIcon={<Plus />} size="sm" aria-label="Add item" />
          <Button iconOnly leftIcon={<Search />} variant="outline" aria-label="Search" />
          <Button iconOnly leftIcon={<Edit />} variant="ghost" aria-label="Edit" />
          <Button iconOnly leftIcon={<Trash />} colorScheme="error" aria-label="Delete" />
          <Button iconOnly leftIcon={<Settings />} rounded aria-label="Settings" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Buttons with Left Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={<User />} variant="primary">Profile</Button>
          <Button leftIcon={<Search />} variant="outline">Search</Button>
          <Button leftIcon={<Mail />} variant="ghost">Messages</Button>
          <Button leftIcon={<FaGoogle />} variant="outline" colorScheme="error">Sign in with Google</Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Buttons with Right Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button rightIcon={<ArrowRight />}>Next</Button>
          <Button rightIcon={<ChevronRight />} variant="outline">View details</Button>
          <Button rightIcon={<Download />} variant="ghost">Download</Button>
          <Button rightIcon={<Upload />} variant="secondary">Upload file</Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Loading State Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button isLoading>Loading</Button>
          <Button isLoading loadingText="Processing..." variant="outline">Submit</Button>
          <Button isLoading variant="ghost">Saving</Button>
          <Button isLoading colorScheme="success">Submitting</Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Button Sizes</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button leftIcon={<Check />} size="xs">Extra Small</Button>
          <Button leftIcon={<Check />} size="sm">Small</Button>
          <Button leftIcon={<Check />} size="md">Medium</Button>
          <Button leftIcon={<Check />} size="lg">Large</Button>
          <Button leftIcon={<Check />} size="xl">Extra Large</Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Social Media Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={<FaGoogle />} colorScheme="error" variant="outline">Google</Button>
          <Button leftIcon={<FaFacebook />} style={{ backgroundColor: '#1877F2' }}>Facebook</Button>
          <Button leftIcon={<FaTwitter />} style={{ backgroundColor: '#1DA1F2' }}>Twitter</Button>
          <Button leftIcon={<FaApple />} variant="secondary">Apple</Button>
        </div>
      </div>
    </div>
  );
};
