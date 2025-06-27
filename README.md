# SaaS E-commerce Telecommunication Platform

A mobile-first, responsive SaaS platform for telecommunication services enabling users to perform single and bulk airtime purchases across multiple Ghanaian networks (MTN, Vodafone, AirtelTigo).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Implementation Status](#implementation-status)
  - [Completed](#completed)
  - [In Progress](#in-progress)
  - [To Be Implemented](#to-be-implemented)
- [Getting Started](#getting-started)
- [API Integration](#api-integration)
- [Design System](#design-system)
- [Authentication](#authentication)

## Features

- 🔐 Complete authentication system with JWT
- 🎨 Customizable theme system for branding
- 📱 Mobile-first, responsive design
- 💰 Wallet management system
- 🔄 Single and bulk airtime purchases
- 📊 Transaction history and reporting
- 👤 User profile management
- 📋 Agent and subscriber roles
- 📝 AFA registration

## Tech Stack

- **Frontend**
  - React with TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - React Router for navigation
  - Context API for state management

- **Backend** (to be implemented)
  - Node.js with Express
  - MongoDB with Mongoose
  - JWT for authentication
  - Multer for file uploads
  - SheetJS for Excel processing

## Project Structure

```plaintext
saas-ecommerce/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React context providers
│   ├── design-system/ # Design system components
│   ├── hooks/         # Custom React hooks
│   ├── layouts/       # Page layout components
│   ├── pages/         # Page components
│   ├── providers/     # Provider components
│   ├── routes/        # Routing configuration
│   ├── services/      # API service layer
│   └── types/         # TypeScript type definitions
├── docs/              # Documentation
└── README.md          # Project documentation
```

## Implementation Status

### Completed

- ✅ **Design System**
  - Theme context and provider with theming support
  - Reusable components:
    - Button (with variants, sizes, and loading state)
    - Input (with validation and error states)
    - Card (with header, body, footer sections)
    - Badge (for status indicators)
    - Alert (for notifications with different statuses)
    - Toast (for transient notifications)
  - Mobile-first responsive layout components
  - Consistent styling and theming across all components

- ✅ **Authentication System**
  - Complete AuthContext with state management
  - Authentication hooks for easy access
  - Login functionality with remember me option
  - Registration with user type selection
  - Forgot password flow
  - Password reset mechanism
  - Email verification process
  - Protected routes to secure dashboard access
  - Toast notifications for auth events

- ✅ **Layout System**
  - Responsive dashboard layout
  - Collapsible sidebar navigation
  - Mobile-optimized header with menu toggle
  - Adaptive layouts for all screen sizes

### In Progress

- 🚧 **Authentication Backend Integration**
  - Mock auth services are implemented
  - Real backend integration pending
  - Token refresh mechanism
  - Session management
  - Comprehensive error handling

- 🚧 **Toast Notification System**
  - Basic toast implementation complete
  - Need to add notifications for all auth events
  - Need to implement persistence options
  - Need to add customization options

### To Be Implemented

- 📝 **Dashboard Features**
  - Quick links for network selections
  - Wallet balance display and management
  - Transaction overview and analytics
  - Recent transactions table with filtering
  - Bulk purchase functionality

- 🔒 **Advanced Security Features**
  - Two-factor authentication
  - Account lockout after failed attempts
  - CSRF protection
  - Rate limiting
  - Session timeout management

- 📱 **Network-Specific Pages**
  - MTN airtime purchase flow
  - Vodafone airtime purchase flow
  - AirtelTigo airtime purchase flow
  - Bulk purchase interface
  - Charts and statistics

- 📝 **Order Pages**
  - Single order forms for all networks
  - Bulk order form for MTN
  - Excel upload functionality

- 📝 **History**
  - Transaction history page
  - Filters and sorting
  - Export functionality

- 📝 **User Profile**
  - Profile page with user info
  - Settings and preferences

- 📝 **AFA Registration**
  - Registration form
  - Fee assignment logic

- 📝 **Backend Development**
  - Authentication API endpoints
  - User management
  - Transaction processing
  - File handling for bulk uploads

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/saas-ecommerce.git
   cd saas-ecommerce
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the development server

   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## API Integration

The frontend is currently using mock services for authentication and data. To implement a real backend:

1. Create REST API endpoints for each function (login, register, etc.)
2. Update the service files to make actual fetch/axios calls to those endpoints
3. Handle token storage and refresh properly
4. Implement proper error handling and response parsing

Detailed API implementation guide is available in [`docs/api-implementation.md`](docs/api-implementation.md).

## Design System

The project implements a comprehensive, mobile-first design system using Tailwind CSS:

### Components

- **Button**: Multiple variants (primary, secondary, outline, ghost), sizes, and states including loading
- **Input**: Form inputs with validation states, error messages, and icons
- **Card**: Flexible card component with header, body, and footer sections
- **Badge**: Status indicators with different colors and sizes
- **Alert**: Notification banners with different statuses (error, warning, info, success)
- **Toast**: Transient notification system with configurable duration and types

### Theme System

- **ThemeProvider**: Context provider for theme management
- **useTheme**: Hook for accessing and modifying theme
- **Theme Tokens**: Consistent design tokens for colors, spacing, typography
- **CSS Variables**: Theme values exposed as CSS variables for easy customization

### Responsiveness

- Mobile-first approach
- Breakpoint system for adapting layouts
- Collapsible navigation for small screens
- Touch-friendly interactive elements

### Usage

```tsx
// Example of using design system components
import { Button, Card, CardHeader, CardBody, Input } from '../design-system';

const MyComponent = () => (
  <Card variant="elevated" size="lg">
    <CardHeader>Title</CardHeader>
    <CardBody>
      <Input 
        label="Email" 
        type="email" 
        placeholder="Enter email"
        error={emailError} 
      />
      <Button variant="primary" isLoading={loading}>
        Submit
      </Button>
    </CardBody>
  </Card>
);
```

## Authentication

The authentication system provides a complete user authentication flow:

### Auth Features

- **Context-based Auth State**: Centralized authentication state management
- **Protected Routes**: Route guards to prevent unauthorized access
- **JWT Authentication**: Token-based authentication with localStorage persistence
- **Complete Auth Flows**:
  - Login with remember me option
  - Registration with user type selection
  - Forgot password request
  - Password reset with token verification
  - Account verification
- **Toast Notifications**: Success and error notifications for auth events
- **Form Validation**: Client-side validation for all auth forms
- **Error Handling**: Comprehensive error handling for all auth operations

### Implementation

- **AuthContext**: Manages auth state and provides auth methods
- **useAuth**: Custom hook for accessing auth context
- **AuthProvider**: Context provider for auth services
- **ProtectedRoute**: HOC for securing routes
- **Auth Pages**: Complete set of responsive, mobile-friendly auth pages

### Current Status

The authentication system is fully implemented on the frontend with mock services. To connect to a real backend:

1. Implement JWT token handling in the auth service
2. Add token refresh mechanism
3. Create comprehensive error handling for network issues
4. Implement secure token storage strategy
5. Add session timeout handling

```tsx
// Example of using the auth context
import { useAuth } from '../hooks';

const LoginComponent = () => {
  const { login, authState } = useAuth();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {authState.error && <Alert status="error">{authState.error}</Alert>}
      {/* Form fields */}
      <Button type="submit" isLoading={authState.isLoading}>Login</Button>
    </form>
  );
};
```
