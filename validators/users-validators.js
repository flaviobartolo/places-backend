const { check } = require('express-validator')

const VALIDATORS = {
  name:     check('name')
              .not()
              .isEmpty(),
  email:    check('email')
              .not()
              .isEmpty()
              .withMessage('email is required')
              .bail() // if email is empty, the following will not run
              .normalizeEmail()
              .isEmail()
              .withMessage('email not valid'),
  password: check('password')
              .isLength({min: 5, max: 15})
              .withMessage('must be between 5 and 15 characters long')
}

module.exports = VALIDATORS