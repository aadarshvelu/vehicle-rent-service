const bodyParser = require('body-parser');
const { bookDateIfAvailable } = require("../utils/db");

/**
 * 
 * Booking Date Handler
 * 
 * @param app express router
 * 
 * @returns null
 */

module.exports = (app) => {
    var urlEncodedParser = bodyParser.urlencoded({extended: false});

    app.post("/book", urlEncodedParser, async (req, res) => {
        console.log(req.body)
        const response = await bookDateIfAvailable(req.body)
        res.status(response.statusCode)
        return res.send(response)
    })
}