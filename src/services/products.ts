import { Service } from "typedi";
import { allProductInfo, to_String } from "@src/astCaver";
import { Product } from "@src/types";

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
}
