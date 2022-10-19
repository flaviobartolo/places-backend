const express = require('express')

const placesControllers = require('../controllers/places-controller')
const fileUpload = require('../middleware/file-upload')
const PLACES_VALIDATORS = require('../validators/places-validators')

const router = express.Router()


router.route('/:pid')
  .get(placesControllers.getPlaceById)
  .patch([
      PLACES_VALIDATORS.title,
      PLACES_VALIDATORS.description
    ], 
    placesControllers.updatePlace)
  .delete(placesControllers.deletePlace)
router.get('/user/:uid', placesControllers.getPlacesByUser)
router.post('/',
  fileUpload.single('image'), 
  [
    PLACES_VALIDATORS.title,
    PLACES_VALIDATORS.description,
    PLACES_VALIDATORS.address
  ], 
  placesControllers.createPlace)


module.exports = router