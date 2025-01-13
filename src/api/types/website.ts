export interface Website {
  websiteId: number;
  name: string;
}

export const websites: Website[] = [
  { websiteId: 0, name: 'All websites' },
  { websiteId: 1, name: 'Sky007' },
  { websiteId: 2, name: 'Bbia' },
  { websiteId: 3, name: 'Hince' },
  { websiteId: 4, name: 'Mixsoon' }
];

export const getWebsiteName = (websiteId: number): string => {
  if (websiteId === undefined || websiteId === null) return 'N/A';
  const website = websites.find(w => w.websiteId === websiteId);
  return website?.name || 'All websites';
};