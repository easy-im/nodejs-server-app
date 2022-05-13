import BasicModel from './base';
import { RelationTb } from '../types/database';

class Service extends BasicModel<RelationTb> {
  /**
   * 判断用户是不是自己的好友
   *
   * @param {number} uid 用户ID
   * @param {number} friendId 好友用户ID
   * @returns 群信息
   */
  async getUserFriend(uid: number, friendId: number) {
    return this.find({
      uid,
      friend_id: friendId,
      status: 1,
    });
  }

  /**
   * 判断用户是不是自己的好友
   *
   * @param {number} uid 用户ID
   * @param {string} remarkOfFriend 用户给好友的备注
   * @param {number} friendId 好友用户ID
   * @param {string} remarkOfUser 好友给自己的备注
   * @returns 群信息
   */
  async makeFriend(uid: number, remarkOfFriend: string, friendId: number, remarkOfUser: string) {
    let id1 = 0;
    const data1 = {
      uid,
      friend_id: friendId,
      remark: remarkOfFriend,
      status: 1,
    };
    const record1 = await this.find({ uid, friend_id: friendId });
    if (record1 && record1.id) {
      await this.update({ id: record1.id }, data1);
      id1 = record1.id;
    } else {
      const [res] = await this.insert(data1);
      id1 = res;
    }

    let id2 = 0;
    const data2 = {
      uid: friendId,
      friend_id: uid,
      remark: remarkOfUser,
      status: 1,
    };
    const record2 = await this.find({ uid: friendId, friend_id: uid });
    if (record2 && record2.id) {
      await this.update({ id: record2.id }, data2);
      id2 = record2.id;
    } else {
      const [res] = await this.insert(data2);
      id2 = res;
    }
    return [id1, id2];
  }
}

const RelationService = new Service('app_relation');
export default RelationService;
