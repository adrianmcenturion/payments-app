import {arca} from "@/lib/arca";

// Consultar datos del CUIT 20111111111
async function main() {
  const taxpayerDetails =
    await arca.registerInscriptionProofService.getTaxpayerDetails(20111111111);

  if (taxpayerDetails) {
    console.log("Datos del contribuyente:", taxpayerDetails);
  } else {
    console.log("Contribuyente no encontrado.");
  }
}

main().catch((err) => {
  console.error("Error al obtener datos del contribuyente:", err);
});
