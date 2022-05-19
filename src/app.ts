import express, { Application, NextFunction, Request, Response } from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { Server } from 'socket.io';
import expressJwt from 'express-jwt';
import config from './config';
import IndexRouter from './routes';
import UserRouter from './routes/user';
import MessageRouter from './routes/message';
import SocketAuth from './socket/auth';
import Chat from './socket/chat';
import redis from './helper/redis';
import { fail, getToken, success } from './helper/util';

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
    getToken,
    async isRevoked(req, _, done) {
      const token = getToken(req);
      const exist = await redis.get(`easy_im_revoked_token_${token}`);
      return done(null, !!exist);
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
  res.json(fail('not found', 404));
});

// 500 error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _: Request, res: Response, _next: NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    return res.json(fail('invalid token', 401));
  }

  return res.json(
    success(
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
  console.log('IM 服务在 8360端口启动');
});
