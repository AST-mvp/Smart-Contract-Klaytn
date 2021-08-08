import { parse as uuidParse, stringify as uuidStringify } from "uuid";

export const uuidToHex = (uuid: string) => {
  return `0x${Array.from(uuidParse(uuid))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
};

export const hexToUuid = (hex: string) => {
  if (hex.length < 10) return hex;
  return uuidStringify(
    [...Array(16)]
      .map((_, i) => i)
      .reduce(
        ([string, prev]) =>
          [
            string.slice(2),
            [...prev, Number.parseInt(string.slice(0, 2), 16)] as number[],
          ] as const,
        [BigInt(hex).toString(16).padStart(32, "0"), [] as number[]] as const
      )[1]
  );
};
