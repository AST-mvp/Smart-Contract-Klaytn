import Multer from 'multer';
import Container from 'typedi';

const multerLoader = () => {
  Container.set(
    'multer.image',
    Multer({
      storage: Multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, next) => {
        next(null, file.mimetype.startsWith('image/'));
      },
    }),
  );
};

export default multerLoader;
