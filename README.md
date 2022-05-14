# kitim 服务

[![star](https://img.shields.io/github/stars/AspenLuoQiang/kitim?style=social)](https://github.com/AspenLuoQiang/speedy-im) [![QQ群](https://img.shields.io/badge/QQ%E7%BE%A4-207879913-yellowgreen.svg)](https://jq.qq.com/?_wv=1027&k=9f25XGCW)

[介绍](#介绍) | [开发](#开发) | [开发计划](#开发计划) | [系统架构](#系统架构) | [联系作者](#联系作者)

## 介绍

基于`express` + `mysql` + `socket.io` + `typescript`开发高性能的即时通讯系统。已支持点对点通讯，计划支持群组通讯、上下线等事件消息等众多功能。

## 开发

客户端测试账号密码：

账号：13600000003
密码：admin

```shell
# 克隆项目
$ git clone git@gitee.com:kitim/kitim-server.git
$ cd kitim-server

# 启动数据库
$ cd docker
$ docker-compose up -d mysql
# 导入数据库，见下方导入数据库

# 启动服务端
$ cd ../
$ yarn && yarn dev

# 以上为已开发模式启动服务端，不想改动服务端代码，只是单纯想开启服务器可以如下操作
$ cd docker
$ docker-compose up
```

## 导入数据库

- 本项目使用 docker 部署开发，待 docker 数据库启动后连接数据库，默认数据库配置见下方[MySQL 默认配置](#MySQL默认配置)。
- 导入初始数据库，位置为`docker/mysql/kitim.sql`。

### MySQL 默认配置
- mysql 版本为 5.7.35 (docker 安装的版本是8.x, 对于 `mysqljs` 包是无法连接数据库的)

地址：127.0.0.1  
端口：3307  
用户名：root  
密码：123456

## 开发计划

- [x] [用户管理](#用户管理)
- [x] [联系人管理](#联系人管理)
- [x] [私聊](#私聊)
- [ ] [群聊](#群聊)

## 系统架构

### 后端框架

采用`express` + `socket.io` + `mysql`开发，使用`docker`部署。

#### 错误码

返回结果采用以下结构，错误码参考 HTTP 状态码设计，更多状态码逐步添加中。

```
{
  errno: 200,
  errmsg: '',
  data: {},
}
```

| 错误码 |     含义     |                                           备注 |
| ------ | :----------: | ---------------------------------------------: |
| 0      | 业务操作失败 | 业务上操作失败导致的错误，但未定义具体 code 值 |
| 200    |     正常     |                                    HTTP 状态码 |
| 401    |    未登陆    |                                    HTTP 状态码 |
| 500    |   内部错误   |                                    HTTP 状态码 |

## 联系作者

- [qq 群](https://jq.qq.com/?_wv=1027&k=9f25XGCW)
- 公众号，欢迎关注，不定时更新

![前端方程式](https://i.loli.net/2020/05/28/CNcjhm17d9zfvkQ.jpg)
