export DEBUG="true"
export DB_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/mapfishsample
