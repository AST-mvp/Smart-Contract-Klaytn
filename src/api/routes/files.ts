import HttpException from '@src/exceptions/HttpException';
import logger from '@src/loaders/logger';
import FilesService from '@src/services/files';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { Multer } from 'multer';
import Container from 'typedi';
import authRequired from '../middleware/authRequired';
import checkPermission from '../middleware/checkPermission';

const route = Router();

const files = (app: Router) => {
  app.use('/files', authRequired, route);

  const multer = Container.get('multer.image') as Multer;

  route.post(
    '/upload',
    authRequired,
    checkPermission('admin'),
    multer.single('file'),
    expressAsyncHandler(async (req, res) => {
      if (!req.file) throw new HttpException(400, 'file is not provided');
      const filesService = Container.get(FilesService);
      const filename = await filesService.uploadFile(req.file);
      const url = await filesService.generatePublicUrl(filename);
      res.json({ filename, url });
    }),
  );
};

export default files;
