export interface PackagerAsset {
  [key: string]: unknown;
}

const assets: PackagerAsset[] = [];

export function registerAsset(asset: PackagerAsset): number {
  return assets.push(asset);
}

export function getAssetByID(assetId: number): PackagerAsset | undefined {
  return assets[assetId - 1];
}

export default { registerAsset, getAssetByID };
