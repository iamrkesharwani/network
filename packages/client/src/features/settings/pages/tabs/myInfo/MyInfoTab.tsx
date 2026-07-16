import { useLocation } from 'react-router-dom';
import { getActiveMyInfoSegment } from '../../../utils/myInfoSegments';
import MyInfoOverview from './MyInfoOverview';
import BasicInfoCard from '../../../components/myInfo/BasicInfoCard';
import PersonalDetailsCard from '../../../components/myInfo/PersonalDetailsCard';
import LinksCard from '../../../components/myInfo/LinksCard';

const MyInfoTab = () => {
  const location = useLocation();
  const segment = getActiveMyInfoSegment(location.pathname);

  if (segment === 'basic') return <BasicInfoCard />;
  if (segment === 'personal') return <PersonalDetailsCard />;
  if (segment === 'contact') return <LinksCard />;

  return <MyInfoOverview />;
};

export default MyInfoTab;
