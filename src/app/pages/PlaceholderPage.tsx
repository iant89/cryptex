import { Skeleton } from '@enterprise-ui/react';
import { useLocation } from 'react-router';
import { findNavItem } from '../navigation';
import { PageHeader } from './PageHeader';
import { NotFoundPage } from './NotFoundPage';

/** Placeholder for every §4 route: the approved Skeleton loading state (mockup 01). */
export function PlaceholderPage() {
  const match = findNavItem(useLocation().pathname);
  if (!match) return <NotFoundPage />;
  return (
    <section className="cx-page" aria-labelledby="cx-page-title" aria-busy="true">
      <PageHeader match={match} />
      <Skeleton width="60%" height={10} />
      <div className="cx-skeleton-cards">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="cx-skeleton-card">
            <Skeleton width="55%" height={8} />
            <Skeleton width="35%" height={14} />
          </div>
        ))}
      </div>
      <div className="cx-skeleton-table">
        {Array.from({ length: 16 }, (_, i) => (
          <Skeleton key={i} width={`${95 - ((i * 7) % 15)}%`} height={10} />
        ))}
      </div>
      <p className="cx-muted cx-page-note">
        {match.item.label} is planned for a later phase. Every page renders inside this region.
      </p>
    </section>
  );
}
