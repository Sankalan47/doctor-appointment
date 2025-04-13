// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="relative">
          <div className="text-9xl font-bold text-primary/10">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          </div>
        </div>

        <p className="text-lg text-gray-600">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="pt-6 border-t border-gray-200 mt-6">
          <p className="text-sm text-gray-500">
            If you think this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
