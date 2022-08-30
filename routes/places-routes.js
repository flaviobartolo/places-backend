const express = require('express')

const placesControllers = require('../controllers/places-controller')

const router = express.Router()

router.route('/:pid')
  .get(placesControllers.getPlaceById)
  .patch(placesControllers.updatePlace)
  .delete(placesControllers.deletePlace)
router.get('/user/:uid', placesControllers.getPlaceByUser)
router.post('/', placesControllers.createPlace)

module.exports = router