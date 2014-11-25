Win@Life
=========

Purpose:  University of Drexel Fall Quarter 2014 CS575:  Software Design Project 3


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


Structure
=========
Win@Life uses AngularJS for the front end interface while talking to NodeJS for server side applications. Storage of user information will be held in a MongoDB Database while information on the functionality of the award system will be held in JSON files on the server. 

