# Build and run the API container with host networking

docker build -t todo-api --target development .
docker run --name todo-api --network host todo-api

docker start todo-api
docker stop todo-api
docker logs -f todo-api
