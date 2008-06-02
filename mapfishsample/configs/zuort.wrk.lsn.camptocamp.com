export DEBUG="true"

export DB_ROUTING_URL="postgres://www-data:www-data@localhost:45433/v0.3_epfl"
export DB_SEARCH_URL="postgres://www-data:www-data@localhost:45433/v0.3_c2corg"
export DB_GEOSTAT_URL="postgres://www-data:www-data@localhost:45433/v0.3_geostat"

