import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// rota principal (já tem)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "SoulHash API"
  });
});

// 🔥 ESSA É A IMPORTANTE
app.post("/agent", (req, res) => {
  const { input } = req.body;

  res.json({
    result: "Resposta do agent: " + input
  });
});

app.listen(3000, () => {
  console.log("rodando 🚀");
});
