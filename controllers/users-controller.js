const { v4: uuidv4 } = require('uuid')

const HttpError = require('../models/http-error')

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

const createUser = (req, res, next) => {
  const {name, email, password, address, picture} = req.body

  const checkEmailExists = DUMMY_USERS.find((u) => u.email === email)

  if (checkEmailExists) {
    return next( new HttpError('that email is already registered.', 422))
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
    address,
    picture
  } 
  DUMMY_USERS.push(newUser)
  res.status(201).json({user: newUser})
}

const loginUser = (req, res, next) => {
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