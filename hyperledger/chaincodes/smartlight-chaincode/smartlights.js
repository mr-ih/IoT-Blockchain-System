'use strict';

// Deterministic JSON.stringify()
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class SmartLightContract extends Contract {

    /**
     * Initializes the ledger with sample smart light events.
     */
    async InitLedger(ctx) {
        const events = [
            {
                eventID: 'light_001',
                deviceType: 'light',
                deviceID: 'light_05',
                timestamp: '2025-03-14T18:45:00Z',
                eventType: 'on',
                location: 'Building B - Corridor',
                metadata: 'brightness:75; energyConsumption:5W'
            },
            {
                eventID: 'light_002',
                deviceType: 'light',
                deviceID: 'light_05',
                timestamp: '2025-03-14T18:47:00Z',
                eventType: 'off',
                location: 'Building B - Corridor',
                metadata: 'brightness:65; energyConsumption:4W'
            },
            {
                eventID: 'light_003',
                deviceType: 'light',
                deviceID: 'light_05',
                timestamp: '2025-03-14T18:49:00Z',
                eventType: 'on',
                location: 'Building B - Corridor',
                metadata: 'brightness:80; energyConsumption:6W'
            }
        ];

        for (const event of events) {
            event.docType = 'smartLightEvent';
            // Ensure deterministic JSON ordering using json-stringify-deterministic and sort-keys-recursive
            await ctx.stub.putState(event.eventID, Buffer.from(stringify(sortKeysRecursive(event))));
        }
    }

    /**
     * CreateEvent creates a new smart light event in the ledger with the provided details.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     * @param {String} deviceType The type of device (should be "light").
     * @param {String} deviceID Identifier for the smart light.
     * @param {String} timestamp ISO formatted timestamp.
     * @param {String} eventType The event type ("on" or "off").
     * @param {String} location Where the event occurred.
     * @param {String} metadata Event metadata containing brightness and energy consumption.
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
            docType: 'smartLightEvent'
        };

        await ctx.stub.putState(eventID, Buffer.from(stringify(sortKeysRecursive(eventRecord))));
        return JSON.stringify(eventRecord);
    }

    /**
     * ReadEvent returns the smart light event stored in the ledger with the given eventID.
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
     * UpdateEvent updates an existing smart light event in the ledger with the new details.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     * @param {String} deviceType The type of device.
     * @param {String} deviceID Identifier for the smart light.
     * @param {String} timestamp ISO formatted timestamp.
     * @param {String} eventType The event type.
     * @param {String} location Where the event occurred.
     * @param {String} metadata Updated metadata containing brightness and energy consumption.
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
            docType: 'smartLightEvent'
        };

        await ctx.stub.putState(eventID, Buffer.from(stringify(sortKeysRecursive(updatedEvent))));
        return JSON.stringify(updatedEvent);
    }

    /**
     * DeleteEvent removes a smart light event from the ledger.
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
     * EventExists checks whether a smart light event with the given eventID exists in the ledger.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     */
    async EventExists(ctx, eventID) {
        const eventJSON = await ctx.stub.getState(eventID);
        return eventJSON && eventJSON.length > 0;
    }

    /**
     * GetAllEvents returns all smart light events found in the ledger.
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
                console.error(err);
                record = strValue;
            }
            if (record.docType && record.docType === 'smartLightEvent') {
                allResults.push(record);
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = SmartLightContract;