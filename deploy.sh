docker build . -t boilerplate:latest
docker container run -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY boilerplate:latest npm run serverless:deploy