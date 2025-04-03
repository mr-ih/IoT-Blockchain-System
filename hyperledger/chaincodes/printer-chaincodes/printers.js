'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class PrinterEventContract extends Contract {
    /**
     * Initializes the ledger with sample printer events.
     */
    async InitLedger(ctx) {
        const events = [
            {
                eventID: 'printer_001',
                deviceType: 'printer',
                deviceID: 'printer_1',
                timestamp: '2025-03-14T09:30:00Z',
                eventType: 'completed',
                location: 'Library',
                metadata: 'jobID:job_001; pagesPrinted:5; userID:student1'
            },
            {
                eventID: 'printer_002',
                deviceType: 'printer',
                deviceID: 'printer_1',
                timestamp: '2025-03-14T09:32:00Z',
                eventType: 'completed',
                location: 'Library',
                metadata: 'jobID:job_002; pagesPrinted:12; userID:student2'
            },
            {
                eventID: 'printer_003',
                deviceType: 'printer',
                deviceID: 'printer_1',
                timestamp: '2025-03-14T09:34:00Z',
                eventType: 'completed',
                location: 'Library',
                metadata: 'jobID:job_003; pagesPrinted:7; userID:student3'
            }
        ];

        for (const event of events) {
            event.docType = 'printerEvent';
            await ctx.stub.putState(event.eventID, Buffer.from(stringify(sortKeysRecursive(event))));
        }
    }

    /**
     * CreateEvent creates a new printer event in the ledger.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     * @param {String} deviceType The type of device (should be "printer").
     * @param {String} deviceID Identifier for the printer.
     * @param {String} timestamp ISO formatted timestamp.
     * @param {String} eventType The event type (e.g., "completed").
     * @param {String} location Where the event occurred.
     * @param {String} metadata Metadata string containing jobID, pagesPrinted, and userID.
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
            docType: 'printerEvent'
        };

        await ctx.stub.putState(eventID, Buffer.from(stringify(sortKeysRecursive(eventRecord))));
        return JSON.stringify(eventRecord);
    }

    /**
     * ReadEvent returns the printer event stored in the ledger with the given eventID.
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
     * UpdateEvent updates an existing printer event in the ledger.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     * @param {String} deviceType The type of device.
     * @param {String} deviceID Identifier for the printer.
     * @param {String} timestamp ISO formatted timestamp.
     * @param {String} eventType The event type.
     * @param {String} location Where the event occurred.
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
            docType: 'printerEvent'
        };

        await ctx.stub.putState(eventID, Buffer.from(stringify(sortKeysRecursive(updatedEvent))));
        return JSON.stringify(updatedEvent);
    }

    /**
     * DeleteEvent removes a printer event from the ledger.
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
     * EventExists checks whether a printer event with the given eventID exists.
     * @param {Context} ctx The transaction context.
     * @param {String} eventID Unique identifier for the event.
     */
    async EventExists(ctx, eventID) {
        const eventJSON = await ctx.stub.getState(eventID);
        return eventJSON && eventJSON.length > 0;
    }

    /**
     * GetAllEvents returns all printer events found in the ledger.
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
            if (record.docType && record.docType === 'printerEvent') {
                allResults.push(record);
            }
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }
}

module.exports = PrinterEventContract;