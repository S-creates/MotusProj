## Simple Motus Game Project
#Project Overview

The Simple Motus Game is a web-based word guessing game, similar to the classic game show format. Players are tasked with guessing a "word of the day" by submitting their guesses and receiving feedback on each letter's correctness. The feedback is categorized into three classes:

    Correct: The letter is in the word and in the correct position.
    Present: The letter is in the word but not in the correct position.
    Absent: The letter is not in the word at all.

The game also features user AUTHENTIFICATION, SCORE TRACKING, and a MULTISERVICE ARCHITECTURE that includes a API to handle requests.
Technical Instructions on How to Run the Project

To get the Simple Motus Game up and running, follow these steps:
Prerequisites

# The following installations are needed:

    Docker and Docker Compose
    Node.js (the project uses version 20.11)
    A Redis server (included in the docker-compose file)

# Running the Project

    Build the Docker Images: Navigate to the project directory and run::

    Docker and Docker Compose
    Node.js (the project uses version 20.11)
    A Redis server (included in the docker-compose file)
    
    docker-compose -f docker-compose.yml -f dockercomposeredis.yml up --build

    This command uses two Docker Compose files: one for the main application services and the other for setting up Redis and RedisInsight.

    Start the Services: After building, the Docker Compose command will start the services defined in the YAML files.

    Access the Application: Once the services are up, access the game via http://localhost:3000 and the authentication service at http://localhost:3001.
# Starting the Services:

    For the authentication service: 
     npm start

    For the game service:
     node index.js
Redis:

    Make sure Redis is running and accessible at redis://127.0.0.1:6379.

    
# PERTINENT QUESTIONS

    Which server are we going to use?
    We are using a Node.js express server for both the game logic and the authentication service.

    Which ports are we going to use?
    For the game service, we are using port 3000. The authentication service uses port 3001. HAProxy is configured to listen on port 3001 and distribute the load to the game services.


    Which API are we going to call? Which parameters?
    
    We have several APIs:
        /login and /register for user authentication, taking login and password as parameters.
        /checkword for the game logic, which takes word as the parameter.
        /getscore and /setscore for score management, which will take the login and score-related parameters such as successfulAttempt.

    Can we handle more than one user?
    Yes, the game can handle multiple users. User sessions are managed through Redis, and the HAProxy load balancer allows for scaling the application to handle increased loads.

    What data do we want to store?
    We want to store user authentication data and their corresponding hashed passwords, along with the users' game scores, including the number of words found, the total tries, and the average tries per word.
    
    


    
