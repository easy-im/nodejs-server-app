import express from 'express';
import multer from 'multer';
import { fail, success } from '../../helper/util';
import uploadFile from '../../helper/qiniu';

const upload = multer({ dest: '/tmp' });

const router = express.Router();

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.json(fail('上传出错'));
  }
  const { type = 'image' } = req.body;
  const { originalname, path: filepath } = req.file;
  const ext = originalname.split('.').reverse()[0];

  const data = await uploadFile(filepath, ext, type);
  res.json(success(data));
});

export default router;
