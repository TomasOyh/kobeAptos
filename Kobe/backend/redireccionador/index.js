const express = require("express");
const { processInput } = require("./main");
const cors = require("cors");

const { deployToAptos } = require("../aptosBranch/deployer");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta para manejar el input del usuario
app.post("/api/process", async (req, res) => {
  try {
    // console.log("Solicitud recibida en el backend:", req.body);

    const { userTask } = req.body;
    const result = await processInput(userTask);

    // console.log("Respuesta generada:", result);

    if (result) {
      res.json(result);
    } else {
      console.error("Error: Respuesta vacía o nula.");
      res
        .status(500)
        .json({ error: "Error en la generación de la respuesta." });
    }
  } catch (error) {
    console.error("Error en el backend:", error);
    res.status(500).json({ error: error.message });
  }
});


// Ruta para manejar el despliegue en Aptos
app.post("/api/deploy/aptos", async (req, res) => {
  try {
    const transactionHash = await deployToAptos();
    if (transactionHash) {
      res.json({ transactionHash });
    } else {
      res.status(500).json({ error: "Failed to deploy contract on Aptos" });
    }
  } catch (error) {
    console.error("Error en el despliegue en Aptos:", error);
    res.status(500).json({ error: error.message });
  }
});

// Configuración del puerto
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
