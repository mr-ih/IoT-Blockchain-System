'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class CO2SensorContract extends Contract {
    /**
     * Initialize the ledger with some sample CO₂ sensor events.
     */
    async InitLedger(ctx) {
        const events = [
            {
                eventID: 'sensor_001',
                deviceType: 'co2_sensor',
                deviceID: 'sensor_03',
                timestamp: '2025-03-14T20:00:00Z',
                eventType: 'reading',
                location: 'Building C - Lab',
                metadata: 'co2Level:500; temperature:20'
            },
            {
                eventID: 'sensor_002',
                deviceType: 'co2_sensor',
                deviceID: 'sensor_03',
                timestamp: '2025-03-14T20:02:00Z',
                eventType: 'reading',
                location: 'Building C - Lab',
                metadata: 'co2Level:650; temperature:22'
            },
            {
                eventID: 'sensor_003',
                deviceType: 'co2_sensor',
                deviceID: 'sensor_03',
                timestamp: '2025-03-14T20:04:00Z',
                eventType: 'reading',
                location: 'Building C - Lab',
                metadata: 'co2Level:800; temperature:21'
            }
        ];

        for (const event of events) {
            event.docType = 'co2SensorEvent';
            await ctx.stub.putState(event.eventID, Buffer.from(stringify(sortKeysRecursive(event))));
        }
    }

    /**
     * CreateEvent records a new CO₂ sensor event in the ledger.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event (e.g., "sensor_004").
     * @param {String} deviceType The type of device (should be "co2_sensor").
     * @param {String} deviceID Identifier for the sensor (e.g., "sensor_03").
     * @param {String} timestamp ISO formatted timestamp.
     * @param {String} eventType The type of event (e.g., "reading").
     * @param {String} location Location where the event occurs (e.g., "Building C - Lab").
     * @param {String} metadata String containing the dynamic sensor data (e.g., "co2Level:700; temperature:23").
     */
    async CreateEvent(ctx, eventID, deviceType, deviceID, timestamp, eventType, location, metadata) {
        const exists = await this.EventExists(ctx, eventID);
        if (exists) {
            throw new Error(`The event ${eventID} already exists`);
        }
        const eventRecord = {
            eventID,
            deviceType,
            deviceID,
            timestamp,
            eventType,
            location,
            metadata,
            docType: 'co2SensorEvent'
        };

        await ctx.stub.putState(eventID, Buffer.from(stringify(sortKeysRecursive(eventRecord))));
        return JSON.stringify(eventRecord);
    }

    /**
     * ReadEvent retrieves a CO₂ sensor event from the ledger by eventID.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     */
    async ReadEvent(ctx, eventID) {
        const eventJSON = await ctx.stub.getState(eventID);
        if (!eventJSON || eventJSON.length === 0) {
            throw new Error(`The event ${eventID} does not exist`);
        }
        return eventJSON.toString();
    }

    /**
     * UpdateEvent updates an existing CO₂ sensor event in the ledger.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique event identifier.
     * @param {String} deviceType The type of device.
     * @param {String} deviceID Identifier of the sensor.
     * @param {String} timestamp ISO formatted timestamp.
     * @param {String} eventType The event type.
     * @param {String} location Event location.
     * @param {String} metadata Updated metadata string.
     */
    async UpdateEvent(ctx, eventID, deviceType, deviceID, timestamp, eventType, location, metadata) {
        const exists = await this.EventExists(ctx, eventID);
        if (!exists) {
            throw new Error(`The event ${eventID} does not exist`);
        }
        const updatedEvent = {
            eventID,
            deviceType,
            deviceID,
            timestamp,
            eventType,
            location,
            metadata,
            docType: 'co2SensorEvent'
        };

        await ctx.stub.putState(eventID, Buffer.from(stringify(sortKeysRecursive(updatedEvent))));
        return JSON.stringify(updatedEvent);
    }

    /**
     * DeleteEvent removes a CO₂ sensor event from the ledger.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     */
    async DeleteEvent(ctx, eventID) {
        const exists = await this.EventExists(ctx, eventID);
        if (!exists) {
            throw new Error(`The event ${eventID} does not exist`);
        }
        await ctx.stub.deleteState(eventID);
    }

    /**
     * EventExists checks whether a CO₂ sensor event with the given eventID exists in the ledger.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     */
    async EventExists(ctx, eventID) {
        const eventJSON = await ctx.stub.getState(eventID);
        return eventJSON && eventJSON.length > 0;
    }

    /**
     * GetAllEvents returns all CO₂ sensor events stored in the ledger.
     * @param {Context} ctx The transaction context.
     */
    async GetAllEvents(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = result.value.value.toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            if (record.docType && record.docType === 'co2SensorEvent') {
                allResults.push(record);
            }
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }
}

module.exports = CO2SensorContract;