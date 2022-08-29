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

  res.json({place})
})

router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid
  
  userPlaces = DUMMY_PLACES.filter((p) => p.creator === userId)

  res.json(userPlaces)
})

module.exports = router