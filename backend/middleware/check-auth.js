const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try{
    // bearer token
    const token = req.headers.authorization.split(" ")[1];
    const decodedData = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { email: decodedData.email, userId: decodedData.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: "You are not authenticated!"});
  }

};
