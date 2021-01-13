import db from '../lib/db';

class RelationRequest {
  private table = 'relation_request';

  /**
   * 获取好友请求
   *
   * @param {number} id 请求ID
   * @returns 群信息
   */
  async getRequestId(id: number) {
    try {
      const data = await db
        .table(this.table)
        .where({
          id,
        })
        .find();
      return [null, data];
    } catch (err) {
      return [err, null];
    }
  }

  /**
   * 获取自己的好友请求列表
   *
   * @param {number} uid 用户ID
   * @returns 群信息
   */
  async getRequestList(uid: number) {
    try {
      const data = await db
        .table(this.table)
        .where({
          dist_id: uid,
        })
        .select();
      return [null, data];
    } catch (err) {
      return [err, null];
    }
  }

  /**
   * 获取对方还未同意的好友请求
   *
   * @param {number} uid 用户ID
   * @param {number} distId 目标用户ID
   * @returns 群信息
   */
  async getPendingRequest(uid: number, distId: number) {
    try {
      const data = await db
        .table(this.table)
        .where({
          uid,
          dist_id: distId,
          status: 0,
        })
        .find();
      return [null, data];
    } catch (err) {
      return [err, null];
    }
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
    try {
      const data = await db.table(this.table).add({
        uid,
        dist_id,
        message,
        remark,
        status: 0,
      });
      return [null, data];
    } catch (err) {
      return [err, null];
    }
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
    try {
      const data = await db.table(this.table).where({ id }).update({
        status,
      });
      return [null, data];
    } catch (err) {
      return [err, null];
    }
  }
}

export default new RelationRequest();
