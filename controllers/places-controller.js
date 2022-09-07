const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place')


let DUMMY_PLACES = [{
  id: 'p1',
  title: 'Empire State Building',
  description: 'One of the most famous sky scrapers in the world!',
  location: {
    lat: 40.7484405,
    lng: -73.9856644
  },
  address: '20 W 34th St., New York, NY 10001',
  creator: 'u1'
},
{
  id: 'p2',
  title: 'Empire State Building 2',
  description: 'One of the most famous sky scrapers in the world!',
  location: {
    lat: 40.7484405,
    lng: -73.9856644
  },
  address: '20 W 34th St., New York, NY 10001',
  creator: 'u1'
}]


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

const updatePlace = (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).json({message:'Invalid inputs passed please check your data', errors: errors.array()})
  }

  const placeId = req.params.pid
  const {title, description} = req.body
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId)
  
  if (!DUMMY_PLACES[placeIndex]) {
    return next(new HttpError(`Could not find a place for the provided place id of: ${placeId}`, 404))
  }
  const updatedPlace = {...DUMMY_PLACES[placeIndex]} // creating a new array with a clone of the place; reason why we use the spread operator: https://academind.com/tutorials/reference-vs-primitive-values
  updatedPlace.title = title || updatedPlace.title
  updatedPlace.description = description || updatedPlace.description
  DUMMY_PLACES[placeIndex] = updatedPlace

  res.status(200).json({place: updatedPlace})
}

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid
  if (!DUMMY_PLACES.find((p) => p.id === placeId)){
    return next(new HttpError(`Could not find a place to delete for the provided place id of: ${placeId}`, 404))
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId) // it returns a brand new array so its not copying the pointer

  res.status(200).json({message: 'Deleted place.'})
}


exports.getPlaceById = getPlaceById
exports.updatePlace = updatePlace
exports.getPlacesByUser = getPlacesByUser
exports.createPlace = createPlace
exports.deletePlace = deletePlace