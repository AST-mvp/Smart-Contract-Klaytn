import Brand, { BrandCreationAttributes } from "@src/model/Brand";
import { Inject, Service } from "typedi";

@Service()
export default class NfcsService {
  constructor(@Inject("models.brands") private brandModel: typeof Brand) {}

  public async fetchAllBrands() {
    return this.brandModel.findAll();
  }

  public async addNewBrand(brandInfo: BrandCreationAttributes) {
    return this.brandModel.create(brandInfo);
  }

  public async fetchBrandById(brandId: string) {
    return this.brandModel.findByPk(brandId);
  }
}
