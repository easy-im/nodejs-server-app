import express from 'express';
import jwt from 'jsonwebtoken';
import debug from 'debug';
import pinyin from 'pinyin';
import { Message as MessageData, FriendInfo } from '../interface/entity';
import config from '../config';
import Util from '../helper/util';
import User from '../service/user';
import Message from '../service/message';
import Relation from '../service/relation';
import RelationRequest from '../service/relationRequest';

const log = debug('kitim user');

const router = express.Router();

/**
 * 从token获取用户信息
 *
 * @method GET
 * @param {token} string
 */
router.get('/info', async (req, res) => {
  const { user } = req as any;
  const { uid } = user || {};
  const [err, info] = await User.getUserInfoById(+uid);
  if (err) {
    log(err);
    return res.json(Util.fail('内部服务器错误', 500));
  }
  if (!info) {
    return res.json(Util.success('用户不存在', 401));
  }
  delete info.password;
  delete info.client_id;
  delete info.create_time;
  return res.json(Util.success(info));
});

/**
 * 登录
 *
 * @method POST
 * @param {number} mobile 手机号
 * @param {string} password 密码
 * @param {'android' | 'ios' | 'web'} platform 登陆平台
 */
router.put('/signIn', async (req, res) => {
  const { mobile, password, platform = 'android' } = req.body;
  if (!mobile || mobile.length !== 11 || !password) {
    return res.json(Util.fail('用户不存在或密码错误', 0));
  }
  const passwordEncode = Util.encodePassword(password);
  const [err, userInfo] = await User.getUserInfoByPassword(mobile, passwordEncode);
  if (err) {
    log(err);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  if (!userInfo || !userInfo.id) {
    return res.json(Util.fail('用户不存在或密码错误', 0));
  }

  const payload = {
    uid: userInfo.id,
  };
  const options = {
    expiresIn: '90d',
  };
  const token = jwt.sign(payload, config.jwt.secret, options);
  const [err2] = await User.updateUserToken(userInfo.id, { token, platform });
  if (err2) {
    log(err2);
    return res.json(Util.fail('数据库写入失败', 500));
  }

  delete userInfo.password;
  return res.json(
    Util.success({
      ...userInfo,
      token,
    }),
  );
});

/**
 * 注册
 *
 * @method POST
 * @param {number} mobile 手机号
 * @param {string} password 密码
 */
router.post('/signUp', async (req, res) => {
  let { mobile, password = '', nickname = '' } = req.body;
  password = password.trim();
  nickname = nickname.trim();
  mobile = `${mobile}`.trim();

  if (!mobile || mobile.length !== 11 || !Util.isPhoneNumber(mobile)) {
    return res.json(Util.fail('手机号不正确', 0));
  }
  if (!password || password.length < 6 || password.length > 18) {
    return res.json(Util.fail('密码不合法', 0));
  }
  if (!nickname) {
    return res.json(Util.fail('昵称不能为空', 0));
  }
  mobile = +mobile;
  const [err, _user] = await User.getUserInfoByMobile(mobile);
  if (err) {
    log(err);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  if (_user) {
    return res.json(Util.fail('手机号已存在', 0));
  }
  const [err2, _nick] = await User.getUserByNickname(nickname);
  if (err2) {
    log(err2);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  if (_nick) {
    return res.json(Util.fail('昵称已被占用', 0));
  }
  const passwordEncode = Util.encodePassword(password);
  const [err3, info] = await User.createUser({
    mobile,
    nickname,
    password: passwordEncode,
    avatar: `https://im.wangcai.me/speedy_avatar_${Util.getRandomInt(1, 8)}.jpg`,
    sex: 0,
    create_time: +new Date(),
  });
  if (err3 || !info.insertId) {
    log(err3);
    return res.json(Util.fail('数据库操作失败', 500));
  }
  return res.json(Util.success(info.insertId));
});

/**
 * 搜索用户
 *
 * @method POST
 * @param {number} mobile 手机号
 */
router.post('/search', async (req, res) => {
  const { user } = req as any;
  const { uid } = user || {};
  let { mobile } = req.body;
  mobile = `${mobile}`.trim();

  if (!mobile || mobile.length !== 11 || !Util.isPhoneNumber(mobile)) {
    return res.json(Util.success(null));
  }
  mobile = +mobile;
  const [err, friend] = await User.getUserInfoByMobile(mobile);
  if (err) {
    log(err);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  if (!friend) {
    return res.json(Util.success(null));
  }
  const [, info] = await Relation.getUserFriend(uid, friend.id);
  const isFriend = !!info;
  const isMe = +friend.id === +uid;

  const [, relation] = await RelationRequest.getPendingRequest(uid, friend.id);

  let status = 0;

  if (isFriend || isMe) {
    status = 1;
  } else if (relation) {
    status = 2;
  }

  return res.json(
    Util.success({
      ...friend,
      status,
    }),
  );
});

/**
 * 获取用户请求列表
 *
 * @method GET
 */
router.get('/friendRequest', async (req, res) => {
  const { user } = req as any;
  const { uid } = user || {};

  const [err, list] = await RelationRequest.getRequestList(uid);
  if (err) {
    log(err);
    return res.json(Util.fail('数据库查询失败', 500));
  }

  return res.json(Util.success(list));
});

/**
 * 请求添加好友
 *
 * @method POST
 * @param {number} fid 对方id
 * @param {string} remark 备注
 */
router.post('/requestToBeFriend', async (req, res) => {
  const { user } = req as any;
  const { uid } = user || {};
  const { fid, remark, message } = req.body;
  const [err, friend] = await User.getUserInfoById(fid);
  if (err) {
    log(err);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  if (!friend) {
    return res.json(Util.fail('用户不存在', 0));
  }
  const [err2, info] = await Relation.getUserFriend(uid, friend.id);
  if (err2) {
    log(err2);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  if (info) {
    return res.json(Util.fail('已经是好友关系', 0));
  }
  const [err3, relation] = await RelationRequest.getPendingRequest(uid, friend.id);
  if (err3) {
    log(err3);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  if (relation) {
    return res.json(Util.fail('已存在好友请求', 0));
  }
  const [err4, data] = await RelationRequest.createRequest({ uid, dist_id: friend.id, remark, message });
  if (err4 || !data.insertId) {
    log(err4);
    return res.json(Util.fail('数据库操作失败', 500));
  }
  return res.json(Util.success(data.insertId));
});

/**
 * 确认好友请求
 *
 * @method POST
 * @param {number} id 请求id
 * @param {boolean} agree 是否同意
 */
router.post('/dealFriendRequest', async (req, res) => {
  const { user } = req as any;
  const { uid } = user || {};
  const { id, agree, remark } = req.body;
  const [err, record] = await RelationRequest.getRequestId(id);
  if (err) {
    log(err);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  if (!record) {
    return res.json(Util.fail('请求不存在', 0));
  }
  if (record.status !== 0) {
    return res.json(Util.fail('该请求已被处理', 0));
  }
  if (record.dist_id !== uid) {
    return res.json(Util.fail('越权处理', 0));
  }
  if (agree) {
    const [err3] = await Relation.makeFriend(uid, remark, record.uid, record.remark);
    if (err3) {
      log(err3);
      return res.json(Util.fail('数据库操作失败', 500));
    }
  }
  const status = agree ? 1 : 2;
  const [err2] = await RelationRequest.updateRequest(id, status);
  if (err2) {
    log(err2);
    return res.json(Util.fail('数据库操作失败', 500));
  }
  return res.json(Util.success({ id, status }));
});

/**
 * 注销登录
 */
router.put('/signOut', async (req, res) => {
  const { user } = req as any;
  const { uid } = user || {};

  await User.updateUserToken(uid, { token: '', platform: '' });
  return res.json(Util.success('ok'));
});

/**
 * 获取好友列表
 *
 * @method GET
 * @param {token} string
 */
router.get('/friends', async (req, res) => {
  const { user } = req as any;
  const { uid } = user || {};
  const [err, data] = await User.getRelationByUid(uid);
  if (err) {
    log(err);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  let final: { key: string; list: any[] }[] = [];
  const obj: any = {};
  const others: any = [];
  data.forEach((item: FriendInfo) => {
    const name = item.remark || item.nickname;
    let firstLetter = '';
    if (/^[\u4e00-\u9fa5]/.test(name)) {
      const p = pinyin(name, {
        style: pinyin.STYLE_FIRST_LETTER,
      });
      firstLetter = (p && p[0] && p[0][0]) || '';
    } else if (/^[a-zA-Z]/.test(name)) {
      firstLetter = name.substring(0, 1);
    }

    if (firstLetter) {
      const letter = firstLetter.toLocaleUpperCase();
      if (!obj[letter]) {
        obj[letter] = [];
      }
      obj[letter].push(item);
    } else {
      others.push(item);
    }
  });
  Object.keys(obj).forEach((key) => {
    final.push({
      key,
      list: obj[key],
    });
  });
  final = final.sort((a, b) => (a.key > b.key ? 1 : -1));
  if (others.length) {
    final.push({
      key: '#',
      list: others,
    });
  }
  return res.json(Util.success(final));
});

/**
 * 获取群组
 *
 * @method GET
 * @param {token} string
 */
router.get('/groups', async (req, res) => {
  const { user } = req as any;
  const { uid } = user || {};
  const [err, list] = await User.getUserGroup(uid);
  if (err) {
    log(err);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  return res.json(Util.success(list));
});

/**
 * 获取未读消息
 *
 * @method GET
 * @param {token} string
 */
router.get('/unreadMessage', async (req, res) => {
  const { user } = req as any;
  const { uid } = user || {};
  // TODO，分页
  const [err, list] = await Message.getUnreadMessage(uid);
  if (err) {
    log(err);
    return res.json(Util.fail('数据库查询失败', 500));
  }
  const tmp: number[] = [];

  const result = list.map((item: MessageData) => {
    tmp.push(item.id as number);
    return {
      ...item,
      is_owner: uid === item.user_id ? 1 : 0,
    };
  });
  if (tmp.length) {
    Message.updateMultipleMessage(tmp, { is_sent: 1 });
  }
  return res.json(Util.success(result));
});

export default router;
