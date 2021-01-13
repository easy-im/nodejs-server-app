import db from '../lib/db';

class Relation {
  private table = 'relation';

  /**
   * 判断用户是不是自己的好友
   *
   * @param {number} uid 用户ID
   * @param {number} friendId 好友用户ID
   * @returns 群信息
   */
  async getUserFriend(uid: number, friendId: number) {
    try {
      const data = await db
        .table(this.table)
        .where({
          uid,
          friend_id: friendId,
          status: 1,
        })
        .find();
      return [null, data];
    } catch (err) {
      return [err, null];
    }
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
    try {
      const data = await db.table(this.table).addMany([
        {
          uid,
          friend_id: friendId,
          remark: remarkOfFriend,
          status: 1,
        },
        {
          uid: friendId,
          friend_id: uid,
          remark: remarkOfUser,
          status: 1,
        },
      ]);
      return [null, data];
    } catch (err) {
      return [err, null];
    }
  }
}

export default new Relation();
