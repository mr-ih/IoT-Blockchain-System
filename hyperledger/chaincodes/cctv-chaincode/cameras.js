'use strict';

// Deterministic JSON.stringify()
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class CCTVEventContract extends Contract {

    /**
     * Initializes the ledger with sample CCTV events.
     */
    async InitLedger(ctx) {
        const events = [
            {
                eventID: 'cctv_001',
                deviceType: 'cctv',
                deviceID: 'cam_101',
                timestamp: '2025-03-14T11:00:00Z',
                eventType: 'motion_detected',
                location: 'Parking Lot A',
                metadata: 'imageReference:img_202503141100_001.jpg'
            },
            {
                eventID: 'cctv_002',
                deviceType: 'cctv',
                deviceID: 'cam_101',
                timestamp: '2025-03-14T11:02:00Z',
                eventType: 'motion_detected',
                location: 'Parking Lot A',
                metadata: 'imageReference:img_202503141102_002.jpg'
            },
            {
                eventID: 'cctv_003',
                deviceType: 'cctv',
                deviceID: 'cam_101',
                timestamp: '2025-03-14T11:04:00Z',
                eventType: 'motion_detected',
                location: 'Parking Lot A',
                metadata: 'imageReference:img_202503141104_003.jpg'
            }
        ];

        for (const event of events) {
            event.docType = 'cctvEvent';
            // Store event data deterministically.
            await ctx.stub.putState(event.eventID, Buffer.from(stringify(sortKeysRecursive(event))));
        }
    }

    /**
     * CreateEvent issues a new CCTV event to the world state with the provided details.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     * @param {String} deviceType The type of device (e.g., 'cctv').
     * @param {String} deviceID Identifier for the CCTV camera.
     * @param {String} timestamp ISO formatted timestamp.
     * @param {String} eventType The event type (e.g., 'motion_detected').
     * @param {String} location The location of the event.
     * @param {String} metadata Additional event metadata (e.g., image reference).
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
            docType: 'cctvEvent'
        };

        await ctx.stub.putState(eventID, Buffer.from(stringify(sortKeysRecursive(eventRecord))));
        return JSON.stringify(eventRecord);
    }

    /**
     * ReadEvent returns the CCTV event stored in the world state with the given eventID.
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
     * UpdateEvent updates an existing CCTV event record in the world state with provided parameters.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     * @param {String} deviceType The type of device.
     * @param {String} deviceID Identifier for the CCTV camera.
     * @param {String} timestamp ISO formatted timestamp.
     * @param {String} eventType The event type.
     * @param {String} location Where the event occurred.
     * @param {String} metadata Additional event metadata.
     */
    async UpdateEvent(ctx, eventID, deviceType, deviceID, timestamp, eventType, location, metadata) {
        const exists = await this.EventExists(ctx, eventID);
        if (!exists) {
            throw new Error(`The event ${eventID} does not exist`);
        }

        // Overwrite the existing event with new values.
        const updatedEvent = {
            eventID,
            deviceType,
            deviceID,
            timestamp,
            eventType,
            location,
            metadata,
            docType: 'cctvEvent'
        };

        await ctx.stub.putState(eventID, Buffer.from(stringify(sortKeysRecursive(updatedEvent))));
        return JSON.stringify(updatedEvent);
    }

    /**
     * DeleteEvent removes a given CCTV event from the world state.
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
     * EventExists checks whether a CCTV event with the given eventID exists in the world state.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     */
    async EventExists(ctx, eventID) {
        const eventJSON = await ctx.stub.getState(eventID);
        return eventJSON && eventJSON.length > 0;
    }

    /**
     * GetAllEvents returns all CCTV events found in the world state.
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
            // Only include records of type 'cctvEvent'.
            if (record.docType && record.docType === 'cctvEvent') {
                allResults.push(record);
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = CCTVEventContract;