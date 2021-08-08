import { Inject, Service } from "typedi";
import {
  allProductInfo,
  changeOwnership,
  registerProductInfo,
} from "@src/astCaver";
import { Op } from "sequelize";
import Nfc, { NfcCreationAttributes } from "@src/model/Nfc";
import { hexToUuid, uuidToHex } from "@src/utils/uuid";
import ProductsService from "./products";
import User from "@src/model/User";

export const DropTypeValues = ["ongoing", "finished"] as const;
export type DropType = typeof DropTypeValues[number];

@Service()
export default class NfcsService {
  constructor(
    @Inject("models.nfcs") private nfcModel: typeof Nfc,
    @Inject("models.users") private userModel: typeof User,
    @Inject(() => ProductsService) private productsService: ProductsService
  ) {}

  /**
   * fetch all products from caver
   */
  public async fetchAllNfcs() {
    const rawProductsInfo = (await allProductInfo()) as any[][];
    const productsPartialInfo = rawProductsInfo.map((rawProductInfo) => ({
      id: hexToUuid(rawProductInfo[0]),
      ownerId: hexToUuid(rawProductInfo[7]),
    }));
    return this.nfcModel.findAll({
      where: {
        id: { [Op.in]: productsPartialInfo.map((product) => product.id) },
      },
      },
      attributes: {
        exclude: ["ownerId", "productId"],
      },
      include: [
        { model: this.userModel, as: "owner", attributes: ["nickname"] },
        "product",
      ],
    });
  }

  /**
   * register new product
   * @param nfc ownerId is uuid
   * @returns registered product. when productId doesn't exist, return null
   */
  public async registerNfc(nfc: NfcCreationAttributes) {
    if (!(await this.productsService.hasProduct(nfc.productId))) {
      return null;
    }
    const nfcData = await this.nfcModel.create(nfc);
    await registerProductInfo(
      uuidToHex(nfcData.id),
      "0",
      uuidToHex(nfc.productId),
      "0",
      "0",
      false,
      false,
      uuidToHex(nfc.ownerId)
    );
    return nfcData;
  }

  /**
   * fetch product by nfc id
   */
  public async fetchProductByNfcId(nfcId: string) {
    const nfcs = await this.fetchAllNfcs();
    return nfcs.find((nfc) => nfc.id === nfcId);
  }

  public async changeOwnership(nfcId: number, userId: string) {
    return changeOwnership(nfcId, uuidToHex(userId));
  }

  public async getCloset(userId: string) {
    const nfcs = await this.fetchAllNfcs();
    return nfcs.filter((nfc) => nfc.ownerId === userId);
  }
}
