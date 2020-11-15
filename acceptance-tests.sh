#!/usr/bin/env bash
docker-compose down --v --remove-orphans

docker-compose up -d --build --force-recreate web

until curl 'http://172.17.0.1:8088/healthcheck' || curl 'http://localhost:8088/healthcheck'; do
  >&2 echo "Web not ready..."
  sleep 5
done

>&2 echo "Web ready"

docker-compose up --build --force-recreate --exit-code-from acceptance_test acceptance_test
