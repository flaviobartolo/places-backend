const { check } = require('express-validator')


const VALIDATORS = {
  title:       check('title')
                .not()
                .isEmpty(),
  description: check('description')
                .isLength({min: 5}),
  address:     check('address')
                .not()
                .isEmpty()
}

module.exports = VALIDATORS