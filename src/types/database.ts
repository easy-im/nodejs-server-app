import { GENDER, MESSAGE_CONTENT_TYPE, MESSAGE_DIST_TYPE, PLATFORM } from '../constants/enum';

export type UserTb = {
  id: number;
  nickname: string;
  mobile: number;
  password: string;
  avatar: string;
  gender: GENDER;
  token: string;
  client_id: string;
  client_type: PLATFORM;
  create_time: number;
  status: number;
};

export type GroupTb = {
  id: number;
  creator: number;
  name: string;
  avatar: string;
  introduce: string;
  limit: number;
  create_time: number;
  status: number;
};

export type MessageTb = {
  id?: number;
  hash: string;
  user_id: number;
  dist_id: number;
  dist_type: MESSAGE_DIST_TYPE;
  content_type: MESSAGE_CONTENT_TYPE;
  is_received?: number;
  is_sent?: number;
  content: string;
  create_time: number;
  status: number;
};

export type RelationTb = {
  id: number;
  uid: number;
  friend_id: number;
  remark: string;
  create_time: number;
  status: number;
};

export type RelationRequest = {
  id: number;
  uid: number;
  dist_id: number;
  message: string;
  remark: string;
  create_time: number;
  status: number;
};
