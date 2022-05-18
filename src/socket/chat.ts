import { Server, Namespace, Socket } from 'socket.io';

import jwt from 'jsonwebtoken';
import User from '../service/user';
import Group from '../service/group';
import Relation from '../service/relation';
import Message from '../service/message';
import config from '../config';
import { MessageRecord } from '../types';
import { MessageTb } from '../types/database';
import { CHAT_MESSAGE, RESPONSE_MESSAGE, SOCKET_RESPONSE } from '../types/response';
import {
  MESSAGE_DIST_TYPE,
  MESSAGE_CONTENT_TYPE,
  SOCKET_MESSAGE_TYPE,
  MESSAGE_RESPONSE_STATUS,
  YES_NO,
} from '../constants/enum';

export default class Chat {
  private namespace = 'chat';

  private io: Server;

  private nsp: Namespace;

  constructor(io: Server) {
    this.io = io;
    this.nsp = io.of(this.namespace);
  }

  setup() {
    this.nsp.on('connect', async (socket: Socket) => {
      const { handshake } = socket;
      const { query } = handshake;
      const { token } = query as any;
      const user: any = jwt.verify(token, config.jwt.secret);
      const { uid } = user;

      console.log('用户已连接', uid);
      await User.updateUserClientId(uid, socket.id);

      // 开始监听数据交互
      this.onMessage(socket, uid);

      // 用户下线
      socket.on('disconnect', (reason: string) => {
        console.log('用户断开连接', reason);
        User.updateUserClientId(uid, '');
      });
    });
  }

  private onMessage(socket: Socket, uid: number) {
    socket.on('message', async (payload: { message: MessageRecord }) => {
      console.log('收到消息：', payload.message);

      const { id } = socket;
      const { message } = payload;
      const { dist_id, dist_type = MESSAGE_DIST_TYPE.PRIVATE, content } = message;

      const response_status_message: RESPONSE_MESSAGE = {
        status: MESSAGE_RESPONSE_STATUS.SUCCESS,
        data: null,
      };
      const response: SOCKET_RESPONSE = {
        message_type: SOCKET_MESSAGE_TYPE.MESSAGE_STATUS_CONFIRM,
        message: response_status_message,
      };

      // 参数错误
      if (!dist_id || !content) {
        response_status_message.status = MESSAGE_RESPONSE_STATUS.INVALID_PARAMS;
        // 告诉用户，消息参数有错误
        socket.emit(id, response);
        return;
      }
      if (dist_type === MESSAGE_DIST_TYPE.PRIVATE) {
        this.handlePrivateMessage(socket, uid, payload);
      } else {
        this.handleGroupMessage(socket, uid, payload);
      }
    });
  }

  private async handlePrivateMessage(socket: Socket, uid: number, payload: { message: MessageRecord }) {
    const { id } = socket;
    const { message } = payload;
    const {
      dist_id,
      dist_type = MESSAGE_DIST_TYPE.PRIVATE,
      content_type = MESSAGE_CONTENT_TYPE.TEXT,
      content,
      hash,
    } = message;
    const create_time = +new Date();
    const response_status_message: RESPONSE_MESSAGE = {
      status: MESSAGE_RESPONSE_STATUS.SUCCESS,
      data: null,
    };
    const response: SOCKET_RESPONSE = {
      message_type: SOCKET_MESSAGE_TYPE.MESSAGE_STATUS_CONFIRM,
      message: response_status_message,
    };

    // 判断对方是否存在
    const friend_info = await User.getUserInfoById(dist_id);
    if (!friend_info) {
      response_status_message.status = MESSAGE_RESPONSE_STATUS.USER_NOT_EXIST;
      socket.emit(id, response);
      return;
    }
    // 判断对方是否是自己的好友，可能未添加对方
    const info1 = await Relation.getUserFriend(uid, dist_id);
    if (!info1) {
      response_status_message.status = MESSAGE_RESPONSE_STATUS.NOT_FRIEND_OF_OTHER;
      socket.emit(id, response);
      return;
    }
    // 判断自己是对方好友，可能自己已被对方拉黑
    const info2 = await Relation.getUserFriend(dist_id, uid);
    if (!info2) {
      response_status_message.status = MESSAGE_RESPONSE_STATUS.NOT_FRIEND_OF_MINE;
      socket.emit(id, response);
      return;
    }
    const sql_message: MessageTb = {
      hash,
      user_id: uid,
      dist_id,
      dist_type,
      content_type,
      content,
      create_time,
      status: 1,
      is_sent: friend_info.client_id ? 1 : 0,
    };
    const [resultId] = await Message.createMessage(sql_message);
    if (!resultId) {
      response_status_message.status = MESSAGE_RESPONSE_STATUS.ERROR;
      // 数据库插入失败
      socket.emit(id, response);
      return;
    }

    // 告诉用户，消息发送成功
    response_status_message.data = {
      hash,
      id: resultId,
      fid: dist_id,
      succeeded: true,
    };
    socket.emit(id, response);

    if (!friend_info.client_id) return;
    // 对方在线，发送消息给对方
    const final_message: MessageRecord = {
      ...sql_message,
      is_owner: 0,
      id: resultId,
    };
    const user_message: CHAT_MESSAGE = {
      type: MESSAGE_DIST_TYPE.PRIVATE,
      sender_id: uid,
      receive_id: dist_id,
      messages: [final_message],
    };
    const user_response: SOCKET_RESPONSE = {
      message_type: SOCKET_MESSAGE_TYPE.PRIVATE_CHAT,
      message: user_message,
    };
    this.nsp.emit(friend_info.client_id, user_response);
    await Message.updateMessage(resultId, { is_sent: YES_NO.YES });
  }

  private async handleGroupMessage(socket: Socket, uid: number, payload: { message: MessageRecord }) {
    const { id } = socket;
    const { message } = payload;
    const {
      dist_id,
      dist_type = MESSAGE_DIST_TYPE.PRIVATE,
      content_type = MESSAGE_CONTENT_TYPE.TEXT,
      content,
      hash,
    } = message;
    const create_time = +new Date();
    const response_status_message: RESPONSE_MESSAGE = {
      status: MESSAGE_RESPONSE_STATUS.SUCCESS,
      data: null,
    };
    const response: SOCKET_RESPONSE = {
      message_type: SOCKET_MESSAGE_TYPE.MESSAGE_STATUS_CONFIRM,
      message: response_status_message,
    };

    // 判断群是否存在并且自己在群里面
    const [, dist_group] = await Group.getUserGroup(uid, dist_id);
    if (!dist_group) {
      response_status_message.status = MESSAGE_RESPONSE_STATUS.NOT_IN_GROUP;
      socket.emit(id, response);
      return;
    }
    const final_message: MessageRecord = {
      hash,
      user_id: uid,
      dist_id,
      dist_type,
      content_type,
      content,
      create_time,
      status: 1,
      is_sent: 1,
      is_owner: 0,
    };
    const result: any = await Message.createMessage(final_message);
    final_message.id = result.insert_id;

    // TODO 群聊处理
  }
}
