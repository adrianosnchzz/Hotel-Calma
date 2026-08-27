import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import * as crypto from "crypto";

const corsHandler = cors({ origin: true });

const SECRET_KEY = "sq7H5aJ1kmZaRjy55LBeaHqMZX03ng03"; // Clave de prueba Redsys
const FUK = "999008888"; // Comercio de prueba Redsys
const TERMINAL = "001";

// Cifrado 3DES del número de orden con la clave secreta
function encrypt3DES(keyBase64: string, data: string): Buffer {
  const key = Buffer.from(keyBase64, "base64");
  const iv = Buffer.alloc(8, 0);
  const cipher = crypto.createCipheriv("des-ede3-cbc", key, iv);
  return Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
}

// Generación de firma HMAC SHA256 exigida por Redsys
function generarFirmaRedsys(secretKey: string, merchantParamsBase64: string, orden: string): string {
  const orderKey = encrypt3DES(secretKey, orden);
  const hmac = crypto.createHmac("sha256", orderKey);
  hmac.update(merchantParamsBase64);
  return hmac.digest("base64");
}

export const crearPagoRedsys = onRequest((req, res) => {
  corsHandler(req, res, () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      const payload = req.body;

      if (!payload || payload.importe === undefined) {
        res.status(400).json({ error: "Datos de reserva incompletos." });
        return;
      }

      const { importe, concepto, orden } = payload;

      const merchantParams = {
        DS_MERCHANT_AMOUNT: importe.toString(),
        DS_MERCHANT_ORDER: String(orden),
        DS_MERCHANT_MERCHANTCODE: FUK,
        DS_MERCHANT_CURRENCY: "978",
        DS_MERCHANT_TRANSACTIONTYPE: "0",
        DS_MERCHANT_TERMINAL: TERMINAL,
        DS_MERCHANT_MERCHANTURL: "https://us-central1-hotel-calma-cdb42.cloudfunctions.net/notificacionRedsys",
        DS_MERCHANT_URLOK: "https://alojamientoscalma.es/pago-exitoso",
        DS_MERCHANT_URLKO: "https://alojamientoscalma.es/pago-cancelado",
        DS_MERCHANT_PRODUCTDESCRIPTION: concepto || "Reserva Alojamientos Calma"
      };

      // 1. Convertir parámetros a Base64
      const jsonParams = JSON.stringify(merchantParams);
      const merchantParametersBase64 = Buffer.from(jsonParams, "utf8").toString("base64");

      // 2. Calcular firma
      const signature = generarFirmaRedsys(SECRET_KEY, merchantParametersBase64, String(orden));

      res.json({
        url: "https://sis-t.redsys.es/sis/realizarPago",
        params: {
          Ds_SignatureVersion: "HMAC_SHA256_V1",
          Ds_MerchantParameters: merchantParametersBase64,
          Ds_Signature: signature
        }
      });
    } catch (err: any) {
      console.error("Error al procesar el pago:", err);
      res.status(500).json({ error: err?.message || "Error al calcular la firma de pago" });
    }
  });
});