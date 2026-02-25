import sodium from "libsodium-wrappers";

export async function encryptSecret(
  value: string,
  base64PublicKey: string
): Promise<string> {
  await sodium.ready;
  const keyBytes = sodium.from_base64(base64PublicKey, sodium.base64_variants.ORIGINAL);
  const messageBytes = sodium.from_string(value);
  const encrypted = sodium.crypto_box_seal(messageBytes, keyBytes);
  return sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL);
}
