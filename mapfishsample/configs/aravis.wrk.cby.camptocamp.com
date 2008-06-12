export DEBUG="true"

export DB_ROUTING_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/epfl
export DB_SEARCH_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/c2corg
export DB_GEOSTAT_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/geostat
