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
app.use(
  cors({
    origin: true,
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieparser());
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, 
    abortOnLimit: true,
    useTempFiles: false,
  })
);


setInterval(() => {
  fetch("https://expensetrackerbackend-1-xbde.onrender.com")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data.success);
    })
    .catch((error) => {
      console.error("Ping failed:", error);
    });
}, 8 * 60 * 1000);  // every 8 minutes


// endpoint to awake the server
app.get("/", (req, res) => {
  try {
    res.status(200).json({
      success:true,
      message:"ping the server"
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error
    })
  }
});


app.use("/api", userRoutes);
app.use("/api", expenseRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend is running on the Port ${PORT}`);
});
