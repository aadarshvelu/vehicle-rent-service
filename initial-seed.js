"use strict";

const { MongoClient } = require("mongodb");

(async () => {
    /*  Data Preparation */
    const carModels = {
        hatchback: ["xeon", "cretria"],
        suv: ["venue", "xuv", "zilo"],
        sedan: ["city", "dzire", "polo"]
    }

    const bikeModels = {
        cruiser: ["platina", "discover"],
        sports: ["pulsar", "ktm", "mt15"]
    }

    let modelDocs = [];

    /* Creating a common model collection documents for all vehicle types */
    const updateModelDocData = (models, type) => {
        Object.keys(models).map((key) => {
            models[key].map((model) => {
                modelDocs.push({
                    parentType: type,
                    vehicleType: key,
                    bookedDates: [],
                    modelName: model,
                    createdAt: new Date()
                })
            })
        })
    }

    updateModelDocData(carModels, "car");
    updateModelDocData(bikeModels, "bike");

    /* Getting vehicle types to update in bike / car collection */
    const getVehicleTypeDocs = (models, type) => {
        return Object.keys(models).map((key) => {
            return {
                parentType: type,
                type: key,
                availableModels: models[key],
                createdAt: new Date()
            }
        })
    }

    let carVehicleTypes = getVehicleTypeDocs(carModels, "car");
    let bikeVehicleTypes = getVehicleTypeDocs(bikeModels, "bike");

    /* DB Pre-Initialize */
    const client = new MongoClient(process.env.dbUrl);
    await client.connect().then(() => console.log("Connected to DB!!!"));

    /* DB Definition */
    const db = await client.db("vehicle-management");

    /* Updating the all models */
    let modelsCollection = await db.collection("models");
    await modelsCollection.insertMany(modelDocs).then(() => console.log("Models Updated!"));

    /* Updating the car collection with their types */
    let carCollection = await db.collection("car");
    await carCollection.insertMany(carVehicleTypes).then(() => console.log("Car Vehicle Types Updated!"));

    /* Updating the bike collection with their types */
    let bikeCollection = await db.collection("bike");
    await bikeCollection.insertMany(bikeVehicleTypes).then(() => console.log("Bike Vehicle Types Updated!"));

    /* Closing DB Connection  */
    await client.close().then(() => console.log("Disconnected from DB!!!"));
})();
