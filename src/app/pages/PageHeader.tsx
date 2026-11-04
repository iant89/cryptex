import type { ReactNode } from 'react';
import { Breadcrumbs, Title } from '@enterprise-ui/react';
import { useNavigate } from 'react-router';
import type { NavMatch } from '../navigation';

export function PageHeader({ match, actions }: { match: NavMatch; actions?: ReactNode }) {
  const navigate = useNavigate();
  const first = match.group.items[0];
  return (
    <div className="cx-page-header">
      <div>
        <Breadcrumbs
          className="cx-breadcrumbs"
          items={[
            {
              label: match.group.label,
              href: first?.path,
              onClick: (e) => {
                if (!first) return;
                e.preventDefault();
                void navigate(first.path);
              },
            },
            { label: match.item.label },
          ]}
        />
        <Title level={1} size="md" id="cx-page-title">
          {match.item.label}
        </Title>
      </div>
      {actions ? <div className="cx-page-actions">{actions}</div> : null}
    </div>
  );
}
