import Brand from '@src/model/Brand';
import Product, { ProductCreationAttributes } from '@src/model/Product';
import { Inject, Service } from 'typedi';
import FilesService from './files';

export const DropTypeValues = ['ongoing', 'finished'] as const;
export type DropType = typeof DropTypeValues[number];

@Service()
export default class ProductsService {
  constructor(
    @Inject('models.brands') private brandModel: typeof Brand,
    @Inject('models.products') private productModel: typeof Product,
    @Inject(() => FilesService) private filesService: FilesService,
  ) {}

  public async fetchAllProducts() {
    const products = await this.productModel.findAll({
      include: { model: this.brandModel, as: 'brand' },
    });
    return Promise.all(
      products.map(async (product) => ({
        ...product,
        imageUri: await this.filesService.generatePublicUrl(product.filename),
      })),
    );
  }

  public async addNewProduct(productInfo: ProductCreationAttributes) {
    return this.productModel.create(productInfo);
  }

  public async fetchProductById(brandId: string) {
    return this.productModel.findByPk(brandId, {
      include: { model: this.brandModel, as: 'brand' },
    });
  }

  public async hasProduct(productId: string) {
    return (
      (await this.productModel.count({
        where: { id: productId },
      })) > 0
    );
  }
}
