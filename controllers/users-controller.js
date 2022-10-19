const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const User = require('../models/user')


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

  const newUser = new User({
    name,
    email,
    image: req.file.path,
    password,
    places: []
  })

  try {
    await newUser.save()
  } catch (err) {
    const error = 'Signup failed, please try again.'
    return next(new HttpError(error, 500 ))
  }

  res.status(201).json({ user: newUser.toObject({getters: true}) })
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

  if (!existingUser || existingUser.password !== password) {
    const error = 'Invalid login credentials.'
    return next(new HttpError(error, 401))
  }
  
  res.json({ message: 'Logged in!', user: existingUser.toObject({getters: true}) })
}


exports.getAllUsers = getAllUsers
exports.createUser = createUser
exports.loginUser = loginUser