import express from "express";

const app = express();

app.use(express.json());
app.use(express.static("public")); // se usar backend/public
