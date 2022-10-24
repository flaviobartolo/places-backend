const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const HttpError = require('../models/http-error')
const User = require('../models/user')

const dotenv = require('dotenv')
dotenv.config()

// Get a user by User ID
const getAllUsers = async (req, res, next) => {

  let allUsers
  try {
    allUsers = await User.find({}, '-password') // exclude the password from the query 
  } catch (err) {
    const error = 'Something went wrong.'
    return next(new HttpError(error, 500))
  }

  if(allUsers.length === 0){
    const error = 'There are no users.'
    return next(new HttpError(error, 200))
  }

  res.json({ users: allUsers.map((user) => user.toObject({getters: true})) })
}


// Create a new User
const createUser = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({message: 'Invalid inputs passed please check your data', errors: errors.array()})
  }

  const {name, email, password, address, image} = req.body

  let existingUser
  try {
    existingUser = await User.findOne({email})
  } catch (err) {
    const error = 'Signup failed, please try again.'
    return next(new HttpError(error, 500))  
  }
  
  if(existingUser){
    const error = 'There is a user with that email already.'
    return next(new HttpError(error, 422))
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (error) {
    return next(new HttpError('Could not create user, please try again', 500))
  }

  const newUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  })

  try {
    await newUser.save()
  } catch (err) {
    const error = 'Signup failed, please try again.'
    return next(new HttpError(error, 500 ))
  }

  let token;
  try {
    token = jwt.sign(
      {userId: newUser.id, email: newUser.email}, 
      process.env.JWT_SECRET, 
      {expiresIn: '1h'}
    )
  } catch (err) {
    const error = 'Signup failed, please try again.'
    return next(new HttpError(error, 500 ))
  }

  res.status(201).json({userId: newUser.id, email: newUser.email, token})
  //res.status(201).json({ user: newUser.toObject({getters: true}) })
}


// Authentication 
const loginUser = async (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).json({message: 'Invalid inputs passed please check your data', errors: errors.array()})
  }

  const {email, password} = req.body

  let existingUser
  try {
    existingUser = await User.findOne({email})
  } catch (err) {
    const error = 'login failed, please try again.'
    return next(new HttpError(error, 500))  
  }

  if (!existingUser) {
    const error = 'Invalid login credentials.'
    return next(new HttpError(error, 401))
  }

  let isValidPassword = false
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (error) {
    return next(new HttpError('Could not log you in, please check your credentials and try again', 500))
  }
  
  if (!isValidPassword) {
    const error = 'Invalid login credentials.'
    return next(new HttpError(error, 401))
  }

  let token;
  try {
    token = jwt.sign(
      {userId: existingUser.id, email: existingUser.email}, 
      process.env.JWT_SECRET, 
      {expiresIn: '1h'}
    )
  } catch (err) {
    const error = 'Login failed, please try again.'
    return next(new HttpError(error, 500 ))
  }

  res.json({userId: newUser.id, email: newUser.email, token})
}


exports.getAllUsers = getAllUsers
exports.createUser = createUser
exports.loginUser = loginUser