export DEBUG="true"

export DB_HOST="localhost:45433"

export DB_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_VERSION}_mapfishsample
