import "server-only";
import {createArcaClient} from "facturas";

const environment = process.env.ARCA_ENVIRONMENT;

if (environment !== "test" && environment !== "production") {
  throw new Error("ARCA_ENVIRONMENT debe ser test o production");
}

// Convierte "\n" literales en saltos de línea reales y saca espacios de más
function normalizePem(value: string | undefined) {
  return value
    ?.replace(/\\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

export const arca = createArcaClient({
  taxId: process.env.ARCA_TAX_ID,
  certificatePem: normalizePem(process.env.ARCA_CERTIFICATE_PEM),
  privateKeyPem: normalizePem(process.env.ARCA_PRIVATE_KEY_PEM),
  environment,
});
