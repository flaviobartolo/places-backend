const jwt = require('jsonwebtoken')

const HttpError = require("../models/http-error")

const dotenv = require('dotenv')
dotenv.config()

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1] // this will give you the value: "Bearer TOKEN" so we need to split the token from the bearer word
    if(!token) {
      throw new Error('Authentication failed')
    }
    const decoded_token = jwt.verify(token, process.env.JWT_SECRET)
    req.userData = {userId: decoded_token.userId}
    next()
  } catch (error) {
      return next( new HttpError('Authentication failed', 401))
  }
}