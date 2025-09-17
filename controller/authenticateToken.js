import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  console.log("Authorization Header:", token);
  if (!token) {
    console.log("No Token Provided");
    return res.status(403).json({ error: "Access Denied" });
  }

  const tokenParts = token.split(" ");

  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    console.log("Incorrect Token Format:", token);
    return res.status(400).json({ error: "Invalid Token Format" });
  }

  const jwtToken = tokenParts[1];
  const JWT_SECRET = process.env.JWT_SECRET;

  jwt.verify(jwtToken, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT Verification Error:", err.message);
      return res.status(401).json({ error: "Invalid Token" });
    }
    console.log("Decoded User:", decoded);
    req.user = decoded;
    res.status(200).json({ message: "User authenticated", user: req.user });
    //next();
  });
};

