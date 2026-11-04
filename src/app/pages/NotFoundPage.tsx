import { useNavigate } from 'react-router';
import { Button, EmptyState } from '@enterprise-ui/react';
import { HOME_PATH } from '../navigation';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <section className="cx-page">
      <EmptyState
        title="Page not found"
        description="This route does not exist in Cryptex."
        actions={
          <Button variant="primary" onClick={() => void navigate(HOME_PATH)}>
            Go to Exchange Dashboard
          </Button>
        }
      />
    </section>
  );
}
