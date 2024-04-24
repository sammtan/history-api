const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require('body-parser');
const eventRepo = require('./repositories/repository.event');

const port = 8463;
const app = express();

// Middleware
app.use(bodyParser.json());
// Endpoints (at Tugas Pendahuluan):
app.get('/events', eventRepo.getAllEvents);
app.post('/events', eventRepo.addEvent);
app.put('/events/:id', eventRepo.updateEvent);
app.delete('/events/:id', eventRepo.deleteEvent);

// Endpoints (at Case Study):
app.post('/events/bulk', eventRepo.addBulkEvents);
app.get('/events/country', eventRepo.getCountry);
app.get('/events/paginate', eventRepo.getPaginatedEvents);

app.listen(port, () => {
    console.log("🚀 Server is running and listening on port ", port);
});