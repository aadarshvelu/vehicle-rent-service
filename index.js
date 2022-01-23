/* Imports */
const express = require('express');
const dataProvider = require("./controllers/dataProvider");
const bookDate = require("./controllers/bookDate");
const cors = require('cors');

/* Initialize */
var app = express()
app.use(cors());
app.use(express.json());

dataProvider(app);
bookDate(app);

/* Server Start */
app.listen(process.env.PORT, () => console.log('started'));