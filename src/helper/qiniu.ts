import md5File from 'md5-file';
import fs from 'fs';
import qiniu from 'qiniu';
import projectConfig from '../config';

const BUCKET = projectConfig.storage?.bucket;
const ACCESS_KEY = projectConfig.storage?.access_key;
const SECRET_KEY = projectConfig.storage?.secret_key;

const putPolicy = new qiniu.rs.PutPolicy({ scope: BUCKET });
const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
const uploadToken = putPolicy.uploadToken(mac);
const config = new qiniu.conf.Config({
  zone: qiniu.zone.Zone_z2,
  useCdnDomain: true,
});
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

enum UploadType {
  IMAGE = 'image',
}
const UPLOAD_PREFIX = {
  [UploadType.IMAGE]: 'app/image/',
};

export default async function uploadFile(filepath: string, ext: string, type: UploadType = UploadType.IMAGE) {
  const md5 = await md5File(filepath);

  const key = `${UPLOAD_PREFIX[type]}${md5}.${ext}`;

  return new Promise((resolve, reject) => {
    formUploader.putFile(uploadToken, key, filepath, putExtra, (error, body, info) => {
      if (info.statusCode === 200) {
        resolve(body.key);
      } else {
        reject(error);
      }
      fs.unlinkSync(filepath);
    });
  });
}
