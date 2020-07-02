# fbchess
I am developing a chat app that also allows you to play chess with friends. 

# Steps to Build

1. Add a `.env` file with `DATABASE_URL` and `ENV=DEVELOPMENT` (You need a MongoDB instance)
2. `docker build --tag fbchess:1.0 .` 
3. `docker run -p 8001:4000 fbchess:1.0` 
4. Access the app at `https://localhost:8001` 


