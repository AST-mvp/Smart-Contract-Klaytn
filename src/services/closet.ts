import { Inject, Service } from "typedi";
import NfcsService from "./nfcs";

export const DropTypeValues = ["ongoing", "finished"] as const;
export type DropType = typeof DropTypeValues[number];

@Service()
export default class ClosetService {
  constructor(@Inject(() => NfcsService) private nfcsService: NfcsService) {}

  public async fetchUsersCloset(userId: string) {
    const nfcs = await this.nfcsService.fetchAllNfcs();
    return nfcs.filter((nfc) => nfc.owner?.id === userId);
  }
}
