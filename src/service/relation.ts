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
      let id1 = 0;
      const data1 = {
        uid,
        friend_id: friendId,
        remark: remarkOfFriend,
        status: 1,
      };
      const record1 = await db.table(this.table).where({ uid, friend_id: friendId }).find();
      if (record1 && record1.id) {
        await db.table(this.table).where({ id: record1.id }).update(data1);
        id1 = record1.id;
      } else {
        const res = await db.table(this.table).add(data1);
        id1 = res.insertId;
      }

      let id2 = 0;
      const data2 = {
        uid: friendId,
        friend_id: uid,
        remark: remarkOfUser,
        status: 1,
      };
      const record2 = await db.table(this.table).where({ uid: friendId, friend_id: uid }).find();
      if (record2 && record2.id) {
        await db.table(this.table).where({ id: record2.id }).update(data2);
        id2 = record2.id;
      } else {
        const res = await db.table(this.table).add(data2);
        id2 = res.insertId;
      }
      return [null, [id1, id2]];
    } catch (err) {
      return [err, null];
    }
  }
}

export default new Relation();
