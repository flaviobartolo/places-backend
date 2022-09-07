const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid
  let place

  try {
    place = await Place.findById(placeId)
    console.log(place)
  } catch (err) { // this error will be triggered incase theres a error on the request
    const error = new HttpError('Something went wrong while getting the place with the provided id', 500)
    return next(error)
  }

  if (!place) { // this error will be triggered incase theres no place for the provided valid ID
    const error = new HttpError(`Could not find a place for the provided place id of: ${placeId}`, 404)
    next(error)
  }

  res.json({ place: place.toObject({getters: true}) }) // we use getters: true because mongoose return an id property for each document
}


const getPlacesByUser = async (req, res, next) => {
  const userId = req.params.uid
  let userPlaces
  
  try {
    userPlaces = await Place.find({creator: userId})
    console.log(userPlaces)
  } catch (err) {
    const error = new HttpError('Something went wrong while fetching user places.', 500)
    return next(error)
  }
  
  if (!userPlaces || userPlaces.length === 0){
    return next(new HttpError(`Could not find a place for the provided user id of: ${userId}`, 404))
  }

  res.json({ places: userPlaces.map((place) => place.toObject({getters: true})) })
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(422).json({message:'Invalid inputs passed please check your data', errors: errors.array()}) // errors.array() returns a array of fields that are not validated
  }
  
  const {title, description, address, creator} = req.body // this is a shortcut for this: const title = req.body.title; const description = req.body.description
  let coordinates // we create a coordinates so coordinates is not just scoped to the try block
  try{
    coordinates = await getCoordsForAddress(address)
  } catch (error) {
    return next(error)
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: 'https://imagens-revista-pro.vivadecora.com.br/uploads/2021/01/Empire-State-Building-se-destaca-na-paisagem-de-Nova-York-foto-Pinterest.jpg',
    creator
  })

  try {
    await createdPlace.save()
  } catch (err) {
    console.log(err)
    return next(new HttpError('Creating place failed.', 500))
  }

  console.log(createdPlace)
  res.status(201).json({place: createdPlace})
}

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).json({message:'Invalid inputs passed please check your data', errors: errors.array()})
  }

  const placeId = req.params.pid
  const {title, description} = req.body

  let place
  try {
    place = await Place.findById(placeId)

    place.title = title || place.title
    place.description = description || place.description

    await place.save()
  } catch (err) {
    return next(new HttpError('Something went wrong while feching/updating this place.', 500))
  }


  res.status(200).json({ place: place.toObject({ getters: true }) })
}

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid

  let place
  try {
    place = await Place.findById(placeId)
    await place.remove()
  } catch (err) {
    return next(new HttpError('Something went wrong, could not fetch/delete this place', 500))
  }

  res.status(200).json({message: 'Deleted place.'})
}


exports.getPlaceById = getPlaceById
exports.updatePlace = updatePlace
exports.getPlacesByUser = getPlacesByUser
exports.createPlace = createPlace
exports.deletePlace = deletePlace