export interface MemberLevel {
  id: number;
  levelName: string;
}

export const memberLevels: MemberLevel[] = [
  { id: 1, levelName: 'Silver' },
  { id: 2, levelName: 'Gold' },
  { id: 3, levelName: 'Diamond' }
];

export const getLevelNameById = (id: number): string => {
  const level = memberLevels.find(level => level.id === id);
  return level?.levelName || '';
};

export interface MembershipViewModel {
  membershipId: number;
  membershipWebsiteId: number;
  websiteId: number;
  fullName: string;
  email: string;
  mainPhoneNumber: string;
  birthday: string;
  registeredTime: string;
  levelId: number;
  levelName: string;
  defaultAddress: string;
  // ... other fields
} 