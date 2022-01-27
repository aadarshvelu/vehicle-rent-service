const { MongoClient } = require('mongodb');
const { v4 } = require("uuid");
const moment = require("moment");

let cachedDB = null;

/**
* @function connectDB
*
* @param null
*
* @returns connection
*
*    This function helps to make constant connection to DB.
*/
const connectDB = async () => {
    try {
        if (!cachedDB) {
            const client = new MongoClient(process.env.dbUrl, { useUnifiedTopology: true, useNewUrlParser: true });

            cachedDB = await client.connect().then(async (connection) => {
                return await connection.db("vehicle-management")
            })

            console.log("Connection Established!!!")
            return cachedDB;
        }
        return await cachedDB;
    } catch (e) {
        console.log("Failed to Connect with DB!!", JSON.stringify(e))
    }
}

/**
* @function getVehicleData
*
* @param parentTye car / bike
*
* @returns response
*
*    This function helps fetch types of vehicle types.
*/
const getVehicleData = async (parentType) => {
    try {
        const db = await connectDB();
        const result = await db.collection(parentType).find({}).toArray();
        const types = result.map((doc) => {
            return doc.type
        })
        return {
            statusCode: 200,
            data: { types },
            message: "Successfully data fetched"
        };
    } catch (e) {
        console.log("Get Data Error", JSON.stringify(e))
        return {
            statusCode: 400,
            message: "Invalid Payload"
        }
    }
}


/**
* @function getModelByVehicleType
*
* @param parentType sedan / sports etc..,
*
* @returns response
*
*    This function helps to fetch all models respective to car / bike.
*/
const getModelByVehicleType = async (parentType, type) => {
    try {
        const db = await connectDB();
        const result = await db.collection(parentType).findOne({ type });
        console.log(result)
        const { availableModels } = result
        return {
            statusCode: 200,
            data: { availableModels },
            message: "Successfully data fetched"
        };
    } catch (e) {
        console.log("Get Data Error", JSON.stringify(e))
        return {
            statusCode: 400,
            message: "Invalid Payload"
        }
    }
}

/**
* @function bookDateIfAvailable
*
* @param request booking details
*
* @returns response
*
*    This function helps to check date if available.
*/
const bookDateIfAvailable = async (request) => {
    try {
        const { model, bookedDate } = request;
        const db = await connectDB();
        const result = await db.collection('models').findOne({ modelName: model })
        if (result) {
            if (result.bookedDates.length === 0) {
                return await registerDates(request, result.bookedDates);
            } else {
                let isBooked = false;

                const bookedStartDate = moment(bookedDate[0]);
                const bookedEndDate = moment(bookedDate[1]);

                result.bookedDates.every((date) => {
                    const existingDateStart = moment(date[0])
                    const existingDateEnd = moment(date[1])

                    if (bookedStartDate.isBetween(existingDateStart, existingDateEnd, undefined, []) || bookedEndDate.isBetween(existingDateStart, existingDateEnd, undefined, [])) {
                        isBooked = true;
                        return false;
                    }    

                    return true;
                })

                if (isBooked) {
                    return {
                        statusCode: 404,
                        message: "Date not available for selected model"
                    };
                }
                   
                return await registerDates(request, result.bookedDates);
            }
        }
    } catch (e) {
        console.log("Post Data Error", e)
        return {
            statusCode: 400,
            message: "Invalid Payload"
        }
    }
}

/**
* @function registerDates
*
* @param request booking details, 
* @param existingBookedDates  array of previous booking dates
*
* @returns response
*
*    This function helps to register date on db.
*/
const registerDates = async (request, existingDates) => {
    const { model, bookedDate } = request;
    try {
        const userId = v4();
        const db = await connectDB();
        await db.collection('users').insertOne({ 
            ...request,
            userId,
         });

         await db.collection('models').updateOne({ modelName: model }, { $set: { bookedDates: [...existingDates, bookedDate] } });
         
         return {
            statusCode: 200,
            message: "Successfully Booked"
        };
    } catch(e) {
        console.log(e)
        return {
            statusCode: 400,
            message: "Something went wrong"
        }
    }
}

/* Exports */
module.exports = {
    getVehicleData,
    getModelByVehicleType,
    bookDateIfAvailable
}