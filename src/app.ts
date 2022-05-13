import express, { Application, NextFunction, Request, Response } from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { Server } from 'socket.io';
import debug from 'debug';
import expressJwt from 'express-jwt';
import config from './config';
import IndexRouter from './routes';
import UserRouter from './routes/user';
import MessageRouter from './routes/message';
import Util from './helper/util';
import SocketAuth from './socket/auth';
import Chat from './socket/chat';
import User from './service/user';

const log = debug('kitim');
const isDev = process.env.NODE_ENV === 'development';
const { jwt: jwtConfig } = config;

const app: Application = express();
const httpServer: http.Server = http.createServer(app);

const io = new Server(httpServer, {
  pingInterval: 5000,
  pingTimeout: 5000,
});
io.use(SocketAuth);
new Chat(io).setup();

app.use(cors());
app.use(logger(isDev ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  expressJwt({
    secret: jwtConfig.secret,
    algorithms: ['HS256'],
    getToken: Util.getToken,
    async isRevoked(req, payload, done) {
      const token = Util.getToken(req);
      const { uid } = payload;
      if (!uid) return done(null, true);
      // TODO 放到redis里面进行优化
      const info = await User.getUserInfoById(uid);
      if (!info || !info.token || info.token !== token) return done(null, true);
      return done(null, false);
    },
  }).unless({
    path: jwtConfig.routeWhiteList,
  }),
);

app.use('/', IndexRouter);
app.use('/api/user', UserRouter);
app.use('/api/message', MessageRouter);

// catch 404 and forward to error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((req, res, next) => {
  res.json(Util.fail('not found', 404));
});

// 500 error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _: Request, res: Response, _next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    return res.json(Util.fail('invalid token', 401));
  }

  return res.json(
    Util.success(
      {
        message: err.message,
        error: isDev ? err : {},
      },
      err.status || 500,
      '内部服务器错误',
    ),
  );
});

httpServer.listen(8360, () => {
  log('IM 服务在 8360端口启动');
});
