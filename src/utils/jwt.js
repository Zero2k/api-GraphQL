import jwt from 'jsonwebtoken';

const checkJWT = async (req, res, next) => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      const { user } = jwt.verify(token, process.env.SECRET);
      req.user = user;
    } catch (err) {
      req.user = null;
    }
  }
  next();
};

export default checkJWT;
