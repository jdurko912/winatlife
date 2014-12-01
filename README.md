Win@Life
=========

Purpose:  University of Drexel Fall Quarter 2014 CS575:  Software Design Project 3

To Pull and Run
========
Install git
Install npm
Run:
- npm install grunt grunt-cli bower yo -g
- git init
- git pull http://github.com/jdurko912/winatlife
- grunt serve
-- Or grunt serve:dist

This should launch your default browser with the address localhost:9000/login.  Note in the issues section that the Facebook login does not work currently, but there is a test account with events already logged, and an admin account.

Test User:
Username:  testuser
Password:  test

Admin:
Username:  admin
password:  admin

About
=========
Win@Life is a web application that makes your life into a fun game!  Logging activities and events in your day translate into experience points in an attribute system.  Just got a pomotion at your job?  +4 to Intelligence and +1 in Charisma!  Did a few lifts at the gym?  +2 to Strenth!  The idea behind this is to build self-confidence by looking back on your score and realizing how much you've accomplished since starting.

The six attributes are:
- Strength (STR) - Muscle, endurance and stamina.
- Dexterity (DEX) - Hand-eye coordination, agility, reflexes, balance and speed.
- Constitution (CON) - Physique, toughness, health (in regards to resistance to disease).
- Intelligence (INT) - IQ, mnemonic ability, reasoning and learning ability.
- Wisdom (WIS) - Judgement, willpower and intuitiveness.
- Charisma (CHA) - Attractiveness, persuasiveness and personal magnetism.

Activies are preset and the user gets to select from them based off categories starting with:
- Career - Accomplishments related to professional career.
- Personal - Accomplishments related to "me" time.
- Academics - Accomplisments related to academia.

Architectural View
========

See DevelopmentView.png and ProcessView.png in online repo.

The architecture of this system is built onto of generator-angular-fullstack.  This implements the MEAN stack which uses MongoDB for the database (users and events), Express.js for routing (route.js), AngularJS for the views (main, account, navbar, and admin) and Node.js for the server (auth, user and event controller).  

Process View is pretty simple, the Client Browser (page rendered in AngularJS) sends requests to the routeProvider (router provided by express.js) which determines which controller to use (server logic provided by Node.js) and stores/loads from a database (MongoDB with Mongoose).

The Development view may be better undrstood when looking at the directory structure of the code.  There are two halves of the code:  server and client.  Because this is a RESTful service, these two do not need each other but the client depends on the server's routing logic to be present.
Client modules depend on AngularJS to be installed.
On the server side, route.js depends depends on Express.js to be installed, while user, event and config modules depend on Mongoose which in turn communicates with a local MongoDB server (which config sets up).  These all depend on Node.js to run.

Structure
=========
Win@Life uses AngularJS for the front end interface while talking to NodeJS for server side applications. Storage of user information will be held in a MongoDB Database while information on the functionality of the award system will be held in JSON files on the server. 

Views:
- Login Screen
- Control Panel
- Configuration
- Admin Panel

DB Schema:  
- User ( _id, login, attrs, name, password, email )
--attrs ( name, points )
*login is a unique username used for the URL
- Event ( _id, name, parent_name, attrs )
--attrs in this case will be the same structure as User, but with the "points" field indicating the addition of points
*Categories for events will be events that contain no attrs


Issues
=============

Still awaiting an App-ID from Facebook to use the Facebook login...
