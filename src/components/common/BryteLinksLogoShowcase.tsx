import React from 'react';
import { 
  BryteLinksSvgLogo, 
  BryteLinksSvgLogoCompact, 
  BryteLinksSvgIcon 
} from './BryteLinksSvgLogo';

/**
 * Demo component showing all logo variations
 * This can be used for testing and showcasing the logos
 */
export const BryteLinksLogoShowcase: React.FC = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          BryteLinks Logo Variations
        </h1>

        {/* Main Logo */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Main Logo</h2>
          <p className="text-gray-600 mb-6">
            Perfect for landing pages, about sections, and prominent brand placement.
          </p>
          <div className="flex justify-center items-center">
            <BryteLinksSvgLogo width={120} height={140} />
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            Default: 120x140px • Scalable SVG
          </div>
        </div>

        {/* Compact Logo */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Compact Logo</h2>
          <p className="text-gray-600 mb-6">
            Ideal for headers, navigation bars, and horizontal layouts.
          </p>
          <div className="flex justify-center items-center">
            <BryteLinksSvgLogoCompact width={200} height={50} />
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            Default: 180x50px • Perfect for navigation
          </div>
        </div>

        {/* Icon Only */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Icon Only</h2>
          <p className="text-gray-600 mb-6">
            Great for favicons, app icons, and small spaces where text isn't needed.
          </p>
          <div className="flex justify-center items-center space-x-8">
            <div className="text-center">
              <BryteLinksSvgIcon width={40} height={40} />
              <div className="mt-2 text-sm text-gray-500">40x40px</div>
            </div>
            <div className="text-center">
              <BryteLinksSvgIcon width={64} height={64} />
              <div className="mt-2 text-sm text-gray-500">64x64px</div>
            </div>
            <div className="text-center">
              <BryteLinksSvgIcon width={96} height={96} />
              <div className="mt-2 text-sm text-gray-500">96x96px</div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Usage Examples</h2>
          
          {/* Header Example */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Navigation Header</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <BryteLinksSvgLogoCompact width={140} height={40} />
                <div className="flex space-x-4 text-sm text-gray-600">
                  <span>Dashboard</span>
                  <span>Orders</span>
                  <span>Settings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Example */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Profile Card</h3>
            <div className="bg-gray-100 p-4 rounded-lg max-w-md">
              <div className="flex items-center space-x-3">
                <BryteLinksSvgIcon width={48} height={48} />
                <div>
                  <div className="font-medium text-gray-900">BryteLinks</div>
                  <div className="text-sm text-gray-500">Telecom Solutions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Different Backgrounds */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">Background Variations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg border text-center">
                <BryteLinksSvgIcon width={64} height={64} />
                <div className="mt-2 text-sm text-gray-500">White Background</div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <BryteLinksSvgIcon width={64} height={64} />
                <div className="mt-2 text-sm text-gray-300">Dark Background</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <BryteLinksSvgIcon width={64} height={64} />
                <div className="mt-2 text-sm text-gray-500">Colored Background</div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Code */}
        <div className="bg-gray-900 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Implementation</h2>
          <div className="space-y-4 text-sm font-mono">
            <div>
              <div className="text-blue-300 mb-1">// Import the logo components</div>
              <div className="text-green-300">
                import {`{ BryteLinksSvgLogo, BryteLinksSvgLogoCompact, BryteLinksSvgIcon }`} from './components/common';
              </div>
            </div>
            <div>
              <div className="text-blue-300 mb-1">// Use in your components</div>
              <div className="text-yellow-300">&lt;BryteLinksSvgLogo width={`{120}`} height={`{140}`} /&gt;</div>
              <div className="text-yellow-300">&lt;BryteLinksSvgLogoCompact width={`{180}`} height={`{50}`} /&gt;</div>
              <div className="text-yellow-300">&lt;BryteLinksSvgIcon width={`{40}`} height={`{40}`} /&gt;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
