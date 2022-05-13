import BasicModel from './base';
import { RelationRequest } from '../types/database';

class Service extends BasicModel<RelationRequest> {
  private table = 'relation_request';

  /**
   * 获取好友请求
   *
   * @param {number} id 请求ID
   * @returns 群信息
   */
  async getRequestById(id: number) {
    return this.find({ id });
  }

  /**
   * 获取自己的好友请求列表
   *
   * @param {number} uid 用户ID
   * @returns 群信息
   */
  async getRequestList(uid: number) {
    return this.knex('app_relation_request as relation_request')
      .leftJoin('app_user as user', 'relation_request.uid', 'user.id')
      .where({
        'relation_request.uid': uid,
      })
      .select('relation_request.*', 'user.nickname', 'user.avatar');
  }

  /**
   * 获取对方还未同意的好友请求
   *
   * @param {number} uid 用户ID
   * @param {number} distId 目标用户ID
   * @returns 群信息
   */
  async getPendingRequest(uid: number, distId: number) {
    return this.find({
      uid,
      dist_id: distId,
      status: 0,
    });
  }

  /**
   * 创建好友请求
   *
   * @param {number} uid 用户ID
   * @param {number} distId 目标用户ID
   * @param {string} remark 备注
   * @returns 群信息
   */
  async createRequest(payload: { uid: number; dist_id: number; remark: string; message: string }) {
    const { uid, dist_id, message, remark } = payload;
    return this.insert({
      uid,
      dist_id,
      message,
      remark,
      status: 0,
    });
  }

  /**
   * 更新请求
   *
   * @param {number} uid 用户ID
   * @param {number} distId 目标用户ID
   * @param {string} remark 备注
   * @returns 群信息
   */
  async updateRequest(id: number, status: number) {
    return this.update(
      { id },
      {
        status,
      },
    );
  }
}

const RelationRequestService = new Service('app_relation_request');
export default RelationRequestService;
