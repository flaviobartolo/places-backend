const express = require('express')

const router = express.Router()

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


router.get('/:pid', (req, res, next) => {
  const placeId = req.params.pid
  
  place = DUMMY_PLACES.find((p) => {
    return p.id === placeId
  })

  if (!place) {
    const error = new Error(`Could not find a place for the provided place id of: ${placeId}`)
    error.code = 404
    throw error // throw error wont work with async calls for that we should use: return next(error)
  }

  res.json({place})
})

router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid
  
  userPlaces = DUMMY_PLACES.filter((p) => p.creator === userId)

  if (userPlaces.length === 0){
    const error = new Error(`Could not find a place for the provided user id of: ${userId}`)
    error.code = 404
    return next(error)
  }

  res.json(userPlaces)
})

module.exports = router