import dev from './dev';
import prod from './prod';
import { EnvType, Config } from '../types/config';

const env: EnvType = (process.env.NODE_ENV as EnvType) || 'local';

const configMap = {
  local: {},
  development: dev,
  production: prod,
};

const defaults = {
  mysql: {
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: '123456',
    database: 'easy-im',
  },
  passwordSecret: 'easy-im',
  jwt: {
    secret: 'easy-im',
    routeWhiteList: ['/', '/favicon.ico', '/api/user/login', '/api/user/logout'],
  },
};

const config: Config = {
  ...defaults,
  ...(configMap[env] || {}),
};

export default config;
