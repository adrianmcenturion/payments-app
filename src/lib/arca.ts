import "server-only";
import {createArcaClient} from "facturas";

type ArcaClient = ReturnType<typeof createArcaClient>;

let client: ArcaClient | undefined;

// Convierte "\n" literales en saltos de línea reales y saca espacios de más
function normalizePem(value: string | undefined) {
  return value
    ?.replace(/\\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

// El cliente se crea la primera vez que se usa, no al importar el archivo
export function getArca(): ArcaClient {
  if (client) return client;

  const environment = process.env.ARCA_ENVIRONMENT;

  if (environment !== "test" && environment !== "production") {
    throw new Error("ARCA_ENVIRONMENT debe ser test o production");
  }

  client = createArcaClient({
    taxId: process.env.ARCA_TAX_ID,
    certificatePem: normalizePem(process.env.ARCA_CERTIFICATE_PEM),
    privateKeyPem: normalizePem(process.env.ARCA_PRIVATE_KEY_PEM),
    environment,
  });

  return client;
}
