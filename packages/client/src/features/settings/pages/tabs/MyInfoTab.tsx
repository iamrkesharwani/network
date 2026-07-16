import BasicInfoCard from '../../components/myInfo/BasicInfoCard';
import PersonalDetailsCard from '../../components/myInfo/PersonalDetailsCard';
import ContactLinksCard from '../../components/myInfo/ContactLinksCard';

const MyInfoTab = () => (
  <div className="max-w-lg">
    <BasicInfoCard />
    <PersonalDetailsCard />
    <ContactLinksCard />
  </div>
);

export default MyInfoTab;
