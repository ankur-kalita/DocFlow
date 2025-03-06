import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next(); 
    }
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    // console.log(process.env.JWT_SECRET);
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Invalid Token" });
  }
};
