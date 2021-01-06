import crypto from "crypto";
import { WXBizData } from "./model";

export function decryptData(
  appId: string,
  sessionKey: any,
  encryptedData: any,
  iv: any
): WXBizData {
  sessionKey = Buffer.from(sessionKey, "base64");
  encryptedData = Buffer.from(encryptedData, "base64");
  iv = Buffer.from(iv, "base64");
  try {
    const decipher = crypto.createDecipheriv("aes-128-cbc", sessionKey, iv);
    decipher.setAutoPadding(true);
    let decoded = decipher.update(encryptedData) as any;
    decoded += decipher.final("utf8");
    decoded = JSON.parse(decoded);
    if (decoded.watermark.appid !== appId) {
      throw new Error("Illegal Buffer");
    }
    return decoded;
  } catch (err) {
    throw new Error(err);
  }
}
