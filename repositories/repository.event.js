const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    database: process.env.DATABASE,

    // Set true if you are using a remote server that uses HTTPS
    // Me: I use local database so I set it to false because I don't use HTTPS
    // Error: The server does not support SSL connections
    // ssl: {
    //     require: false,
    // }
});

console.log(process.env.USER);

pool.connect().then(() => {
    console.log("🛢 Connected to PostgreSQL database");
});

// Adding a record
async function addEvent(req, res) {
    const { title, description, year, period, month, day, country, city } = req.body;
    try {
        const result = await pool.query('INSERT into historical_events (title, description, year, period, month, day, country, city) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [title, description, year, period, month, day, country, city]);
        const newEvent = result.rows[0];
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
// Adding multiple records
async function addBulkEvents(req, res) {
    const events = req.body;
    try {
        const query = 'INSERT into historical_events (title, description, year, period, month, day, country, city) VALUES ';
        const values = events.map((event, index) => `($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8})`).join(',');
        const queryText = query + values + ' RETURNING *';
        const queryValues = events.reduce((acc, event) => acc.concat(Object.values(event)), []);
        const result = await pool.query(queryText, queryValues);
        const newEvents = result.rows;
        res.status(201).json(newEvents);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
// Getting all records
async function getAllEvents(req, res) {
    try {
        const result = await pool.query('SELECT * FROM historical_events');
        const events = result.rows;
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
// Getting records by country
async function getCountry(req, res) {
    const country = req.query.country;
    try {
        const result = await pool.query('SELECT * FROM historical_events WHERE country=$1', [country]);
        const events = result.rows;
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
// Getting paginated records
async function getPaginatedEvents(req, res) {
    const page = req.query.page;
    const pageSize = req.query.pageSize;
    const offset = (page - 1) * pageSize;
    try {
        const result = await pool.query('SELECT * FROM historical_events LIMIT $1 OFFSET $2', [pageSize, offset]);
        const events = result.rows;
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
// Updating a record
async function updateEvent(req, res) {
    const id = req.params.id;
    const { title, description, year, period, month, day, country, city } = req.body;
    try {
        const result = await pool.query('UPDATE historical_events SET title=$1, description=$2, year=$3, period=$4, month=$5, day=$6, country=$7, city=$8 WHERE id=$9 RETURNING *', [title, description, year, period, month, day, country, city, id]);
        const updatedEvent = result.rows[0];
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
// Deleting a record
async function deleteEvent(req, res) {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM historical_events WHERE id=$1', [id]);
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getAllEvents,
    getCountry,
    getPaginatedEvents,
    addEvent,
    addBulkEvents,
    updateEvent,
    deleteEvent
};