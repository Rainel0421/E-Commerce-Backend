require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const webhookRoutes = require("./routes/webhook.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const UploadRoutes = require("./routes/upload.routes");

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',  // Para desarrollo local (Vite)
    'https://e-commerce-frontend-sigma-lemon.vercel.app/' // URL de tu Frontend en Vercel
  ],
  credentials: true
}));

// ⚠️ El webhook de Stripe va ANTES de express.json().
// Stripe firma el body CRUDO; si express.json() lo parsea primero,
// la verificación de la firma falla. Por eso esta ruta va aquí arriba.
app.use("/api/webhooks", webhookRoutes);

// A partir de aquí, el resto de rutas sí leen JSON normal
app.use(express.json());

// Ruta de salud
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API funcionando 🚀" });
});

// Rutas de la app

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", UploadRoutes);




// Manejo de errores (SIEMPRE al final, después de las rutas)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
