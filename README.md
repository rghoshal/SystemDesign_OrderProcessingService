The Order processing Service contained in this repository is a minimalistic design encompassing the key aspects of system design covering an ecommerce application containing
the following components.
-- Front End User Interaction
-- Message Queuing
-- Database containing key data
-- Order processor containing a consumption mechanism to get the data from the queue and process it
-- Order Service

The architecture is containerized and these are the following steps to run the app:
-- Pull the repo
-- docker compose build the repo
-- open the UI ( http://localhost:3001 ) 
-- Fill the details which would POST the item
-- the item would be added to RabbitMQ
-- The order processor would consume the items from queue and file it to database.
