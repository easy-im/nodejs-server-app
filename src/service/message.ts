import { MessageTb } from '../types/database';
import BasicModel from './base';

class Service extends BasicModel<MessageTb> {
  /**
   * 创建一条信息
   *
   * @param {MessageData} message 消息
   * @returns
   */
  async createMessage(message: MessageTb) {
    return this.insert(message);
  }

  /**
   * 获取用户未读消息列表
   *
   * @param {number} uid 用户ID
   * @returns 未读消息列表
   */
  async getUnreadMessage(uid: number) {
    return this.queryBuilder
      .where({
        dist_id: uid,
        dist_type: 1,
      })
      .whereRaw('is_received = ? OR is_sent = ?', [0, 0])
      .select('*');
  }

  /**
   * 更新消息信息
   *
   * @param {number} id 消息ID
   * @param {Record<string, any>} columns 数据列
   */
  async updateMessage(id: number, columns: Record<string, any>) {
    return this.update(
      {
        id,
      },
      columns,
    );
  }

  /**
   * 一次性更新多条消息信息的某个字段
   *
   * @param {number[]} ids 主键列表
   * @param {Record<string, any>[]} columns 数据列
   */
  async updateMultipleMessage(ids: number[], columns: Record<string, any>) {
    return this.queryBuilder.whereIn('id', ids || []).update(columns);
  }
}

const MessageService = new Service('app_message');
export default MessageService;
