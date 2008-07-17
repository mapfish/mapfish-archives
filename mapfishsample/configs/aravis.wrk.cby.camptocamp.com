export DEBUG="true"

export DB_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/mapfishsample

export MVN="/home/elemoine/soft/apache-maven-2.0.8/bin/mvn"
export JAVA_HOME="/usr/lib/jvm/java-6-sun"
