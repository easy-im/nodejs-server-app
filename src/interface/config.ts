export type EnvType = 'local' | 'development' | 'production';

export interface Config {
  mysql: any;
  jwt: {
    secret: string; // jwt加密秘钥
    routeWhiteList: string[];
  };
  passwordSecret: string; // 密码加密存储秘钥
}
