import { Service } from "typedi";
import {
  allProductInfo,
  changeOwnership,
  registerProductInfo,
  to_String,
} from "@src/astCaver";
import { Product } from "@src/types";
import { parse as uuidParse, stringify as uuidStringify } from "uuid";
import dayjs from "dayjs";

@Service()
export default class ProductsService {
  constructor() {}

  /**
   * fetch all products from caver
   */
  public async fetchAllProducts() {
    const rawProductsInfo = (await allProductInfo()) as any[][];
    return rawProductsInfo.map(
      (rawProductInfo) =>
        ({
          nfcID: Number.parseInt(rawProductInfo[0], 10),
          brandID: to_String(rawProductInfo[1]),
          productID: to_String(rawProductInfo[2]),
          editionID: to_String(rawProductInfo[3]),
          manufactureDate: new Date(to_String(rawProductInfo[4])),
          limited: rawProductInfo[5],
          drop: rawProductInfo[6],
          ownerID: this.hexToUuid(rawProductInfo[7]),
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
      dayjs(product.manufactureDate).format("YYYY-MM-DD"),
      product.limited,
      product.drop,
      this.uuidToHex(product.ownerID)
    );
  }

  /**
   * fetch product by nfc id
   */
  public async fetchProductByNfcId(nfcId: number) {
    const products = await this.fetchAllProducts();
    return products.find((product) => product.nfcID === nfcId);
  }

  public async changeOwnership(nfcId: number, userId: string) {
    return changeOwnership(nfcId, this.uuidToHex(userId));
  }

  public async getCloset(userId: string) {
    const products = await this.fetchAllProducts();
    return products.filter((product) => product.ownerID === userId);
  }

  private uuidToHex(uuid: string) {
    return `0x${Array.from(uuidParse(uuid))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
  }

  private hexToUuid(hex: string) {
    try {
      return uuidStringify(
        [...Array(16)]
          .map((_, i) => i)
          .reduce(
            ([string, prev]) =>
              [
                string.slice(2),
                [...prev, Number.parseInt(string.slice(0, 2), 16)] as number[],
              ] as const,
            [
              BigInt(hex).toString(16).padStart(32, "0"),
              [] as number[],
            ] as const
          )[1]
      );
    } catch {
      return hex;
    }
  }
}
