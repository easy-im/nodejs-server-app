import { Request } from 'express';
import crypto from 'crypto';
import config from '../config';

export const getToken = (req: Request): string => req.headers['x-access-token'] || req.body.token || req.query.token;

export const success = (data: any, errno = 200, errmsg = '') => ({
  data,
  errno,
  errmsg,
});

export const fail = (errmsg: string, errno = 500) => ({
  data: null,
  errno,
  errmsg,
});

export const encodePassword = (password: string): string =>
  crypto.createHmac('sha1', config.passwordSecret).update(password).digest('hex');

export const isPhoneNumber = (number: number): boolean =>
  /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57]|19[0-9])[0-9]{8}$/.test(`${number}`);

export const encryptPhoneNumber = (number: number): string => `${number}`.replace(/^(\d{3})(\d{4})(\d{4})/, '$1****$2');

export const getRandomInt = (min: number, max: number) => {
  const minNumber = Math.ceil(min);
  const maxNumber = Math.floor(max);
  return Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber; // 不含最大值，含最小值
};
