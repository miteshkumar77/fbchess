# fbchess
A chat app that also allows you to play chess with friends. 

# Steps to build and run

1. Add a `.env` file with `DATABASE_URL` and `ENV=DEVELOPMENT` (You will need a MongoDB instance)
2. Create a project at google firebase and add your ip address to it's whitelist
3. Replace `config` at `/client/src/services/firebase.tsx` with your own config keys 
4. `docker build --tag fbchess:1.0 .` 
5. `docker run -p 8001:4000 fbchess:1.0` 
6. Access the app at `https://localhost:8001` 


