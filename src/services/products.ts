import Product from "@src/model/Product";
import { Inject, Service } from "typedi";
@Service()
export default class ProductsService {
  constructor(
    @Inject("models.products") private productModel: typeof Product
  ) {}

  public async hasProduct(productId: string) {
    return (
      (await this.productModel.count({
        where: { id: productId },
      })) > 0
    );
  }
}
