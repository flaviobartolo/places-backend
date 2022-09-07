const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const User = require('../models/user')

DUMMY_USERS = [
  {
    uid: 'u1',
    name: 'Flávio',
    email: 'flavio@gmail.com',
    password: 'test123',
    address: 'Test Street 101',
    picture: 'https://png.pngitem.com/pimgs/s/506-5067022_sweet-shap-profile-placeholder-hd-png-download.png'
  },
  {
    uid: 'u1',
    name: 'Laura',
    email: 'laura@gmail.com',
    password: 'test123',
    address: 'Test Street 102',
    picture: 'https://jtphealth.com/wp-content/uploads/2021/06/profile-placeholder-female-3.png'
  }
]

const getAllUsers = (req, res, next) => {
  if(DUMMY_USERS.length === 0){
    return next(new HttpError('There are no users', 404))
  }
  res.json({users: DUMMY_USERS})
}

const createUser = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({message: 'Invalid inputs passed please check your data', errors: errors.array()})
  }

  const {name, email, password, address, image, places} = req.body

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
    image,
    password,
    places 
  })

  try {
    await newUser.save()
  } catch (err) {
    const error = 'Signup failed, please try again.'
    return next(new HttpError(error, 500 ))
  }

  res.status(201).json({ user: newUser.toObject({getters: true}) })
}

const loginUser = (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).json({message: 'Invalid inputs passed please check your data', errors: errors.array()})
  }

  const {email, password} = req.body
  const user = DUMMY_USERS.find((u) => u.email === email && u.password === password)
  if (!user) {
    return next(new HttpError('invalid login credentials', 401))
  }
  res.json({user})
}


exports.getAllUsers = getAllUsers
exports.createUser = createUser
exports.loginUser = loginUser