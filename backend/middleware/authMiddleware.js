// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// async function protect(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Not authorized, token missing" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user)
//       return res
//         .status(401)
//         .json({ message: "Not authorized, user not found" });
//     req.user = user;
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(401).json({ message: "Not authorized, token invalid" });
//   }
// }

// function authorizeAdmin(req, res, next) {
//   if (!req.user) return res.status(401).json({ message: "Not authorized" });
//   if (req.user.role !== "admin")
//     return res.status(403).json({ message: "Admin resources only" });
//   next();
// }

// module.exports = { protect, authorizeAdmin };




//!Version 2



const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================
// AUTHENTICATION MIDDLEWARE
// ==========================
async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
}

// ==========================
// ADMIN AUTHORIZATION
// ==========================
function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admins only." });
  }

  next();
}

module.exports = { protect, adminOnly };
