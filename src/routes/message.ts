import express from 'express';
import { fail, success } from '../helper/util';
import MessageService from '../service/message';

const router = express.Router();

/**
 * 更新消息状态
 *
 * @method GET
 * @param {token} string
 * @param {number[]} ids
 * @param {string} is_received
 */
router.put('/status', async (req, res) => {
  const { ids = [], columns = {} } = req.body;
  const allowColumns = ['is_received', 'is_read'];
  const data: Record<string, number> = {};

  allowColumns.forEach((key) => {
    const item = columns[key];
    // eslint-disable-next-line no-restricted-globals
    if (item !== undefined && !isNaN(item) && (+item === 0 || +item === 1)) {
      data[key] = item;
    }
  });

  if (!Object.keys(data).length) {
    return res.json(fail('参数不合法', 0));
  }

  const result = await MessageService.updateMultipleMessage(ids, data);
  if (!result) {
    return res.json(fail('更新错误', 500));
  }
  return res.json(success(null));
});

export default router;
