import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
      <h1 className="text-4xl font-extrabold text-primary">404</h1>
      <h2 className="text-lg font-bold text-body">Page Not Found</h2>
      <p className="text-sm text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="pt-2">
        <Button onClick={() => navigate(ROUTES.HOME)} className="inline-flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span>Return to Home</span>
        </Button>
      </div>
    </div>
  );
};
