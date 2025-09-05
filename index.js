const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const connectDB = require("./connection");
const userRoutes = require("./routes/user");
const expenseRoutes = require("./routes/expense");
dotenv.config({ override: true });
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use(cookieparser());
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, 
    abortOnLimit: true,
    useTempFiles: false,
  })
);

app.use("/api", userRoutes);
app.use("/api", expenseRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend is running on the Port ${PORT}`);
});
