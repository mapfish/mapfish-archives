export DEBUG="true"

export DB_HOST="localhost:45433"

export DB_ROUTING_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_VERSION}_epfl
export DB_SEARCH_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_VERSION}_c2corg
export DB_GEOSTAT_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_VERSION}_geostat
