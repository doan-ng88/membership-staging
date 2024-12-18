// src/api/membershipAPI.ts
import axiosClient from '../axiosClient';

export const membershipAPI = {
  getList(sortField: string = 'MembershipsWebsitesId', sortType: string = 'ASC', pageSize: number = 20, pageIndex: number = 1, searchParams: any[] = []) {
    return axiosClient.post('/membership/get/get-membership-list',
      {
        sortField,
        sortType,
        pageSize,
        pageIndex,
        searchParams,
      }
    );
  },

  getMemberDetail(userId: number) {
    return axiosClient.get(`/api/membership/get/member-information-detail?user_id=${userId}`);
  },

  updateMembership(data: any) {
    return axiosClient.post('/api/membership/update/membership', data);
  },

  updateAddress(data: any) {
    return axiosClient.post('/api/membership/update/address', data);
  },
};
