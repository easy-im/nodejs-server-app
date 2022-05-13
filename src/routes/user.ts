import express from 'express';
import jwt from 'jsonwebtoken';
import pinyin from 'pinyin';
import { Message as MessageData, FriendInfo } from '../types/database';
import config from '../config';
import Util from '../helper/util';
import UserService from '../service/user';
import MessageService from '../service/message';
import RelationService from '../service/relation';
import RelationRequestService from '../service/relationRequest';
import { GENDER, PLATFORM, SEARCH_USER_TYPE } from '../constants/enum';

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
  const info = await UserService.getUserInfoById(+uid);
  if (!info) {
    return res.json(Util.success('用户不存在', 401));
  }
  // @ts-ignore
  delete info.password;
  // @ts-ignore
  delete info.client_id;
  // @ts-ignore
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
router.put('/login', async (req, res) => {
  const { mobile, password, platform = 'android' } = req.body;
  if (!mobile || mobile.length !== 11 || !password) {
    return res.json(Util.fail('用户不存在或密码错误', 0));
  }
  const passwordEncode = Util.encodePassword(password);
  const userInfo = await UserService.getUserInfoByPassword(mobile, passwordEncode);

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
  await UserService.updateUserToken(userInfo.id, { token, platform });

  // @ts-ignore
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
router.post('/register', async (req, res) => {
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
  const mobileUser = await UserService.getUserInfoByMobile(mobile);
  if (mobileUser) {
    return res.json(Util.fail('手机号已存在', 0));
  }

  const nickUser = await UserService.getUserByNickname(nickname);
  if (nickUser) {
    return res.json(Util.fail('昵称已被占用', 0));
  }

  const passwordEncode = Util.encodePassword(password);
  const [userId] = await UserService.createUser({
    mobile,
    nickname,
    password: passwordEncode,
    avatar: `https://img.qiuzhihu.cn/im/app/avatar/${Util.getRandomInt(1, 8)}.jpeg`,
    gender: GENDER.UNKNOWN,
    create_time: +new Date(),
  });
  if (userId) {
    return res.json(Util.fail('数据库操作失败', 500));
  }
  return res.json(Util.success(userId));
});

/**
 * 注销登录
 */
router.put('/logout', async (req, res) => {
  const { user } = req as any;
  const { uid } = user || {};

  await UserService.updateUserToken(uid, { token: '', platform: PLATFORM.UNKNOWN });
  return res.json(Util.success('ok'));
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
  const friend = await UserService.getUserInfoByMobile(mobile);
  if (!friend) {
    return res.json(Util.success(null));
  }

  const info = await RelationService.getUserFriend(uid, friend.id);
  const isFriend = !!info;
  const isMe = +friend.id === +uid;

  const relation = await RelationRequestService.getPendingRequest(uid, friend.id);

  let status = SEARCH_USER_TYPE.NORMAL;

  if (isFriend || isMe) {
    // 搜索的是自己或自己的朋友
    status = SEARCH_USER_TYPE.DISABLED;
  } else if (relation) {
    // 搜索的用户已经发过请求，但还未同意
    status = SEARCH_USER_TYPE.IN_REQUEST;
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

  const list = await RelationRequestService.getRequestList(uid);

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

  const friend = await UserService.getUserInfoById(fid);
  if (!friend) {
    return res.json(Util.fail('用户不存在', 0));
  }

  const isFriend = await RelationService.getUserFriend(uid, friend.id);
  if (isFriend) {
    return res.json(Util.fail('已经是好友关系', 0));
  }

  const relation = await RelationRequestService.getPendingRequest(uid, friend.id);
  if (relation) {
    return res.json(Util.fail('已发送过好友请求', 0));
  }

  const data = await RelationRequestService.createRequest({ uid, dist_id: friend.id, remark, message });

  return res.json(Util.success(data));
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

  const record = await RelationRequestService.getRequestById(id);
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
    await RelationService.makeFriend(uid, remark, record.uid, record.remark);
  }
  const status = agree ? 1 : 2;
  await RelationRequestService.updateRequest(id, status);
  return res.json(Util.success({ id, status }));
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

  const data = await UserService.getRelationByUid(uid);

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
  const list = await UserService.getUserGroup(uid);
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
  const list = await MessageService.getUnreadMessage(uid);
  const tmp: number[] = [];

  const result = list.map((item: MessageData) => {
    tmp.push(item.id as number);
    return {
      ...item,
      is_owner: uid === item.user_id ? 1 : 0,
    };
  });
  if (tmp.length) {
    MessageService.updateMultipleMessage(tmp, { is_sent: 1 });
  }
  return res.json(Util.success(result));
});

export default router;
