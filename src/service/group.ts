import BasicModel from './base';
import { GroupTb } from '../types/database';

class Service extends BasicModel<GroupTb> {
  /**
   * 获取用户加入的某个群
   *
   * @param {number} uid 用户ID
   * @param {number} groupId 群ID
   * @returns 群信息
   */
  async getUserGroup(uid: number, groupId: number) {
    return this.queryBuilder.where({ uid, group_id: groupId, status: 1 }).select();
  }
}

const GroupService = new Service('app_group');
export default GroupService;
