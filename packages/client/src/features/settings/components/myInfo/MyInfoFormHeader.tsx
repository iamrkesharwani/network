import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CLIENT_ROUTES } from '@network/shared';

interface MyInfoFormHeaderProps {
  title: string;
}

const MyInfoFormHeader = ({ title }: MyInfoFormHeaderProps) => (
  <div className="mb-6">
    <Link
      to={CLIENT_ROUTES.SETTINGS_MY_INFO}
      className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to My Info
    </Link>
    <h3 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
      {title}
    </h3>
  </div>
);

export default MyInfoFormHeader;
