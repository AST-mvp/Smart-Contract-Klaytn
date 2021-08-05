import { Service } from "typedi";
import { allProductInfo, registerProductInfo, to_String } from "@src/astCaver";
import { Product } from "@src/types";
import { parse as uuidParse } from "uuid";

@Service()
export default class ProductsService {
  constructor() {}

  /**
   * fetch all products from caver
   */
  public async fetchAllProducts() {
    const rawProductsInfo = await allProductInfo();
    return rawProductsInfo.map(
      (rawProductInfo: any) =>
        ({
          nfcID: rawProductInfo[0],
          brandID: to_String(rawProductInfo[1]),
          productID: to_String(rawProductInfo[2]),
          editionID: to_String(rawProductInfo[3]),
          manufactureDate: to_String(rawProductInfo[4]),
          limited: rawProductInfo[5],
          drop: rawProductInfo[6],
          ownerID: rawProductInfo[7],
        } as Product)
    );
  }

  /**
   * register new product
   * @param product ownerID is uuid
   * @returns weather successfully register product. when nfcID already exist, return false
   */
  public async registerProduct(product: Product) {
    return registerProductInfo(
      product.nfcID,
      product.brandID,
      product.productID,
      product.editionID,
      product.manufactureDate,
      product.limited,
      product.drop,
      `0x${Array.from(uuidParse(product.ownerID))
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")}`
    );
  }
}
