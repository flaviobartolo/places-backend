const { v4: uuidv4 } = require('uuid')

const HttpError = require('../models/http-error')

const DUMMY_PLACES = [{
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
  creator: 'u2'
}]


const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid

  place = DUMMY_PLACES.find((p) => {
    return p.id === placeId
  })
  if (!place) {
    throw new HttpError(`Could not find a place for the provided place id of: ${placeId}`, 404) // throw error wont work with async calls for that we should use: return next(error)
  }

  res.json({place})
}

const getPlaceByUser = (req, res, next) => {
  const userId = req.params.uid
  
  userPlaces = DUMMY_PLACES.filter((p) => p.creator === userId)
  if (userPlaces.length === 0){
    return next(new HttpError(`Could not find a place for the provided user id of: ${userId}`, 404))
  }

  res.json({places: userPlaces})
}

const createPlace = (req, res, next) => {
  const {title, description, coordinates, address, creator} = req.body // this is a shortcut for this: const title = req.body.title; const description = req.body.description
  console.log(req.body)
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

exports.getPlaceById = getPlaceById
exports.getPlaceByUser = getPlaceByUser
exports.createPlace = createPlace