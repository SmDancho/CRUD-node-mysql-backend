const jwt = require("jsonwebtoken");
const {secret} = require("../config")

module.exports = function (req, res, next) {
  if (req === "options") {
    next();
  }
 
  try {
    const token = req.headers.authorization.split(' ')[1]   
    if(!token) return res.status(403).json({message: 'unauthenticated'});
    
    const decodeddata = jwt.verify(token,secret)
    req.userId = decodeddata.id
    next()
  } catch (e) { 
    console.log(e)
    return res.status(403).json({message: 'unauthenticated'});
  }
};
