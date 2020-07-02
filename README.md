# fbchess
A chat app that also allows you to play chess with friends. 

# Steps to build and run

1. Add a `.env` file with `DATABASE_URL` and `ENV=DEVELOPMENT` (You will need a MongoDB instance)
2. `docker build --tag fbchess:1.0 .` 
3. `docker run -p 8001:4000 fbchess:1.0` 
4. Access the app at `https://localhost:8001` 


