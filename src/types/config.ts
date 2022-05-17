export type EnvType = 'development' | 'production';

export interface Config {
  mysql: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  redis?: {
    host: string;
    password?: string;
    port: number;
    db: number;
  };
  storage?: {
    type: 'qiniu';
    bucket: string;
    cdn_domain: string;
    access_key: string;
    secret_key: string;
  };
  jwt: {
    secret: string; // jwt加密秘钥
    routeWhiteList: string[];
  };
  passwordSecret: string; // 密码加密存储秘钥
}
