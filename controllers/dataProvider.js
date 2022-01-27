const { getVehicleData, getModelByVehicleType } = require("../utils/db");

/**
 * 
 * Data Provider
 * 
 * @param app express router
 * 
 * @returns null
 * 
 */

module.exports = (app) => {
    app.get('/vehicle-types', async (req, res) => {
        const { numberOfWheels } = req.query;
        if (numberOfWheels === '2' || numberOfWheels === '4') {
            const parentType = numberOfWheels === '2' ? "bike" : "car";
            const data = await getVehicleData(parentType);
            res.status(data.statusCode);
            return res.send(data);
        } else {
            res.status(400)
            return res.send({
                status: 400,
                message: "Invalid Payload"
            })
        }
    });

    app.get('/get-models', async (req, res) => {
        const { numberOfWheels, type } = req.query;
        if (numberOfWheels === '2' || numberOfWheels === '4') {
            const parentType = numberOfWheels === '2' ? "bike" : "car";
            const models = await getModelByVehicleType(parentType, type);
            res.status(models.statusCode);
            return res.send(models);
        } else {
            res.status(400)
            return res.send({
                status: 400,
                message: "Invalid Payload"
            })
        }
    });
}