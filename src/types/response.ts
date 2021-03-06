import { MESSAGE_RESPONSE_STATUS, MESSAGE_TYPE, SOCKET_RESPONSE_TYPE } from '../constants/enum';
import { MessageRecord } from '.';

// 发送给其他人消息
export interface CHAT_MESSAGE {
  type: MESSAGE_TYPE; // 私聊还是群聊
  sender_id: number; // 发送者ID
  receive_id: number; // 接收者ID
  messages: MessageRecord[];
}

export interface RESPONSE_MESSAGE {
  status: MESSAGE_RESPONSE_STATUS;
  data: any;
}

// SOCKET统一返回内容
export interface SOCKET_RESPONSE {
  message_type: SOCKET_RESPONSE_TYPE;
  message: CHAT_MESSAGE | RESPONSE_MESSAGE;
}
