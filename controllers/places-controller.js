const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const getCoordsForAddress = require('../util/location')

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


const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid

  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId
  })
  if (!place) {
    throw new HttpError(`Could not find a place for the provided place id of: ${placeId}`, 404) // throw error wont work with async calls for that we should use: return next(error)
  }

  res.json({place})
}

const getPlacesByUser = (req, res, next) => {
  const userId = req.params.uid
  
  userPlaces = DUMMY_PLACES.filter((p) => p.creator === userId)
  
  if (!userPlaces || userPlaces.length === 0){
    return next(new HttpError(`Could not find a place for the provided user id of: ${userId}`, 404))
  }

  res.json({places: userPlaces})
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
  

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator 
  }

  DUMMY_PLACES.push(createdPlace) // we can use unshift() to add it has the first element
  console.log(DUMMY_PLACES)
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