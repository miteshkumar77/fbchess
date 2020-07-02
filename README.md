# fbchess
A chat app that also allows you to play chess with friends. 

# Steps to build and run

1. Add a `.env` file with `DATABASE_URL` and `ENV=DEVELOPMENT` (You will need a MongoDB instance)
2. Create a project at google firebase and add Authentication as a service. 
3. Enable Email/Password, Google, and GitHub Sign-in providers.
4. Add your local ip address to Authorized domains. 
5. Replace `config` at `/client/src/services/firebase.tsx` with your own config keys 
6. `docker build --tag fbchess:1.0 .` 
7. `docker run -p 8001:4000 fbchess:1.0` 
8. Access the app at `https://localhost:8001` 


