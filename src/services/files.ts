import { Inject, Service } from 'typedi';
import admin from 'firebase-admin';
import dayjs from 'dayjs';

@Service()
export default class FilesService {
  constructor(
    @Inject('storage.default')
    private defaultBucket: ReturnType<admin.storage.Storage['bucket']>,
  ) {}

  private generateRandomString() {
    return Math.random().toString(36).slice(2);
  }

  public async uploadFile(file: Express.Multer.File) {
    const filename = `${this.generateRandomString()}_${dayjs().toISOString()}.${
      file.originalname.split('.').reverse()[0]
    }`;
    this.defaultBucket.file(filename).save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });
    return filename;
  }

  public async generatePublicUrl(filename: string) {
    const [url] = await this.defaultBucket.file(filename).getSignedUrl({
      action: 'read',
      expires: dayjs().add(15, 'minute').valueOf(),
    });
    return url;
  }
}
