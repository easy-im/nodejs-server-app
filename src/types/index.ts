import { MessageTb, UserTb } from './database';
import { YES_NO } from '../constants/enum';

export type FriendInfo = Pick<UserTb, 'avatar' | 'client_id' | 'client_type' | 'mobile' | 'status' | 'nickname'> & {
  fid: number;
  remark: string;
};

// 扩展的接口
export type MessageRecord = MessageTb & {
  is_owner: YES_NO;
};
