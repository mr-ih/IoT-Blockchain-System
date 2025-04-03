'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class SensorEventContract extends Contract {

    /**
     * Initialize the ledger with some sensor event data.
     */
    async InitLedger(ctx) {
        const events = [
            {
                eventID: 'card_001',
                deviceType: 'card_reader',
                deviceID: 'reader_01',
                timestamp: '2025-03-14T10:15:30Z',
                eventType: 'swipe',
                location: 'Building A - Main Entrance',
                metadata: 'userID:user1; cardID:card1'
            },
            {
                eventID: 'card_002',
                deviceType: 'card_reader',
                deviceID: 'reader_01',
                timestamp: '2025-03-14T10:17:30Z',
                eventType: 'swipe',
                location: 'Building A - Main Entrance',
                metadata: 'userID:user2; cardID:card2'
            },
            {
                eventID: 'card_003',
                deviceType: 'card_reader',
                deviceID: 'reader_01',
                timestamp: '2025-03-14T10:19:30Z',
                eventType: 'swipe',
                location: 'Building A - Main Entrance',
                metadata: 'userID:user3; cardID:card3'
            }
        ];

        for (const event of events) {
            event.docType = 'sensorEvent';
            await ctx.stub.putState(event.eventID, Buffer.from(stringify(sortKeysRecursive(event))));
        }
    }

    /**
     * RecordEvent creates a new sensor event record on the ledger.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     * @param {String} deviceType Type of the device producing the event.
     * @param {String} deviceID Identifier of the device.
     * @param {String} timestamp ISO formatted timestamp.
     * @param {String} eventType The nature of the event (e.g., swipe).
     * @param {String} location The event location or source.
     * @param {String} metadata Additional metadata information.
     */
    async RecordEvent(ctx, eventID, deviceType, deviceID, timestamp, eventType, location, metadata) {
        const exists = await this.EventExists(ctx, eventID);
        if (exists) {
            throw new Error(`The event ${eventID} already exists`);
        }

        const sensorEvent = {
            eventID,
            deviceType,
            deviceID,
            timestamp,
            eventType,
            location,
            metadata,
            docType: 'sensorEvent'
        };

        await ctx.stub.putState(eventID, Buffer.from(stringify(sortKeysRecursive(sensorEvent))));
        return JSON.stringify(sensorEvent);
    }

    /**
     * ReadEvent retrieves the sensor event record from the ledger using the eventID.
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
     * UpdateEvent updates an existing sensor event record on the ledger.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     * @param {String} deviceType Type of the device.
     * @param {String} deviceID Identifier of the device.
     * @param {String} timestamp ISO formatted timestamp.
     * @param {String} eventType The type of event.
     * @param {String} location Where the event occurred.
     * @param {String} metadata Additional details.
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
            docType: 'sensorEvent'
        };

        await ctx.stub.putState(eventID, Buffer.from(stringify(sortKeysRecursive(updatedEvent))));
        return JSON.stringify(updatedEvent);
    }

    /**
     * DeleteEvent removes a sensor event record from the ledger.
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
     * EventExists checks if an event with the given eventID exists on the ledger.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     */
    async EventExists(ctx, eventID) {
        const eventJSON = await ctx.stub.getState(eventID);
        return eventJSON && eventJSON.length > 0;
    }

    /**
     * GetAllEvents retrieves all sensor event records from the ledger.
     * @param {Context} ctx The transaction context.
     */
    async GetAllEvents(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.error(err);
                record = strValue;
            }
            // Filter to include only sensor event records.
            if (record.docType && record.docType === 'sensorEvent') {
                allResults.push(record);
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = SensorEventContract;