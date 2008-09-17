#!/bin/sh
(cd print; mvn -Duser.name=admin clean deploy site:site site:deploy)
(cd mapfish-geo-lib; mvn -Duser.name=admin clean deploy site:site site:deploy)
