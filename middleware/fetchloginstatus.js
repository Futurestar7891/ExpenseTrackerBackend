const jwt = require("jsonwebtoken");
const User = require("../models/user");

const fetchLoginStatus = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ success: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const userId = decoded.id;
    if(!userId){
        return res.status(401).json({ success: false, message: "Token expired" });
    }
    

    // Fetch user from database
    const user = await User.findById(userId).select("name email photo");

    if (!user) return res.status(404).json({ success: false });

    // Convert photo buffer to base64 string if it exists
    let photoBase64 = null;
    if (user.photo?.data) {
      photoBase64 = `data:${
        user.photo.contentType
      };base64,${user.photo.data.toString("base64")}`;
    }

    return res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        photo: photoBase64 || "", // always a string, never raw buffer
      },
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: false });
  }
};

module.exports = fetchLoginStatus;
