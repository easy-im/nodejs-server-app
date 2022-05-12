import BasicModel from './base';
import { UserTb } from '../types/database';

class Service extends BasicModel<UserTb> {
  private table = 'user';

  /**
   * 创建用户
   *
   * @param {number} info.mobile 用户手机号
   * @param {string} info.password 用户密码
   * @returns 用户信息
   */
  async createUser(info: Partial<UserTb>) {
    return this.insert(info);
  }

  /**
   * 通过手机号查找用户
   *
   * @param {number} mobile 手机号
   * @returns 用户信息
   */
  async getUserInfoByMobile(mobile: number) {
    const [data] = await this.queryBuilder.where({ mobile }).select('id', 'nickname', 'avatar', 'mobile');
    return data;
  }

  /**
   * 通过用户ID查找用户
   *
   * @param {number} uid 用户u
   * @returns 用户信息
   */
  async getUserInfoById(uid: number) {
    return this.find({
      id: uid,
    });
  }

  /**
   * 通过手机号与密码查找用户，登陆验证
   *
   * @param {number} mobile 手机号
   * @param {string} password 密码
   * @returns 用户信息
   */
  async getUserInfoByPassword(mobile: number, password: string) {
    return this.find({
      mobile,
      password,
    });
  }

  /**
   * 通过用户id获取好友列表
   *
   * @param {number} uid 用户ID
   * @returns 好友列表
   */
  async getRelationByUid(uid: number) {
    return this.knex('view_user_friends')
      .where({ uid })
      .select('friend_id as fid', 'nickname', 'remark', 'sex', 'avatar', 'client_id', 'client_type', 'status');
  }

  /**
   * 用户上下线更新token
   *
   * @param {number} uid 用户ID
   * @param {string} payload.token token
   * @param {string} payload.platform 平台
   * @returns 用户信息
   */
  async updateUserToken(uid: number, payload: { token: string; platform: string }) {
    try {
      const data = await db
        .table(this.table)
        .where({
          id: uid,
        })
        .update({
          token: payload.token,
          client_type: payload.platform,
        });
      return [null, data];
    } catch (err) {
      return [err, null];
    }
  }

  /**
   * 用户WS上下线更新client_id
   *
   * @param {number} uid 用户ID
   * @param {string} client_id
   * @returns 用户信息
   */
  async updateUserClientId(uid: number, client_id: string) {
    try {
      const data = await db
        .table(this.table)
        .where({
          id: uid,
        })
        .update({
          client_id,
        });
      return [null, data];
    } catch (err) {
      return [err, null];
    }
  }

  /**
   * 获取用户群组
   *
   * @param {number} uid 用户ID
   */
  async getUserGroup(uid: number) {
    try {
      const data = await db
        .table('view_user_group')
        .where({
          uid,
        })
        .select();
      return [null, data];
    } catch (err) {
      return [err, null];
    }
  }

  /**
   * 获取最后一个用户信息
   */
  async getUserByNickname(nickname: string) {
    try {
      const data = await db.table(this.table).where({ nickname }).find();
      return [null, data];
    } catch (err) {
      return [err, null];
    }
  }
}

const UserService = new Service('app_user');
export default UserService;
