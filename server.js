import express from "express";
import cors from "cors";

const app = express();

// 🔥 obrigatório pra funcionar com GitHub Pages
app.use(cors());
app.use(express.json());

// rota de teste
app.get("/", (req, res) => {
  res.json({
    status: "Agent API online 🚀"
  });
});

// 🔥 rota que o frontend usa
app.post("/agent", (req, res) => {
  const { input } = req.body;

  res.json({
    result: "Agent respondeu: " + input
  });
});

// porta (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("rodando 🚀 na porta " + PORT);
});
