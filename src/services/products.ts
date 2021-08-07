import Brand from "@src/model/Brand";
import Product, { ProductCreationAttributes } from "@src/model/Product";
import { Inject, Service } from "typedi";
@Service()
export default class ProductsService {
  constructor(
    @Inject("models.brands") private brandModel: typeof Brand,
    @Inject("models.products") private productModel: typeof Product
  ) {}

  public async fetchAllProducts() {
    return this.productModel.findAll({
      include: { model: this.brandModel, as: "brand" },
    });
  }

  public async addNewProduct(productInfo: ProductCreationAttributes) {
    return this.productModel.create(productInfo);
  }

  public async fetchProductById(brandId: string) {
    return this.productModel.findByPk(brandId, {
      include: { model: this.brandModel, as: "brand" },
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
