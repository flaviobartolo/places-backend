const express = require('express')

const usersControllers = require('../controllers/users-controller')
const USERS_VALIDATORS = require('../validators/users-validators')
const fileUpload = require('../middleware/file-upload')
const checkAuth = require('../middleware/check-auth')

const router = express.Router()

router.get('/', usersControllers.getAllUsers)
router.post('/signup',
  fileUpload.single('image'),
  [
    USERS_VALIDATORS.name,
    USERS_VALIDATORS.email,
    USERS_VALIDATORS.password
  ], 
  usersControllers.createUser)
router.post('/login',
[
  USERS_VALIDATORS.email,
  USERS_VALIDATORS.password
],
usersControllers.loginUser)


module.exports = router