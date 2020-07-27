const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1Ijoic29kYWgxMTciLCJhIjoiY2tkMjgwMWt2MWFydjJxcXJ4Y3c3bTh1cCJ9.RK88I6XiiOu3j6cJQejuLA'

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  zoom: 9,
  center: [-71.157895, 42.707741],
})

// Fetch stores from API

async function getStores() {
  const ENDPOINT = '/api/v1/stores'

  const res = await fetch(ENDPOINT).catch(e => console.error(`Error fetching stores: ${e.message}`))

  if (res) {
    const data = await res.json()

    const stores = data.data.map(store => {
      const {
        storeId,
        location: { coordinates },
      } = store

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coordinates[0], coordinates[1]],
        },
        properties: {
          storeId: storeId,
          icon: 'shop',
        },
      }
    })

    loadMap(stores)
  }
}

// Load map with stores
function loadMap(stores) {
  map.on('load', function () {
    map.addLayer({
      id: 'points',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stores,
        },
      },
      layout: {
        'icon-image': '{icon}-15',
        'icon-size': 1.5,
        'text-field': '{storeId}',
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 0.9],
        'text-anchor': 'top',
      },
    })
  })
}

getStores()
