import Product, { ProductCreationAttributes } from "@src/model/Product";
import { Inject, Service } from "typedi";
@Service()
export default class ProductsService {
  constructor(
    @Inject("models.products") private productModel: typeof Product
  ) {}

  public async fetchAllProducts() {
    return this.productModel.findAll();
  }

  public async addNewProduct(productInfo: ProductCreationAttributes) {
    return this.productModel.create(productInfo);
  }

  public async fetchProductById(brandId: string) {
    return this.productModel.findByPk(brandId);
  }

  public async hasProduct(productId: string) {
    return (
      (await this.productModel.count({
        where: { id: productId },
      })) > 0
    );
  }
}
