const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {CastError, DocumentNotFoundError, ValidationError} = mongoose.Error;
const uuid = require('uuid');


const Gateway = require('../schemas/gateway');
const Device = require('../schemas/device');

/**
 * @openapi
 * '/gateways':
 *  get:
 *     tags:
 *     - List gateways
 *     summary: Get all gateways
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                  serial:
 *                    type: string
 *                  name:
 *                    type: string
 *                  ip_address:
 *                    type: string
 *       400:
 *         description: Bad request
 */
router.get('/', async function (req, res, next) {
    const query = Gateway.find().populate('devices');
    query.collection(Gateway.collection);
    await query.exec().then((data) => {
        res.send(data);
    }, (err) => {
        console.log(err);
    });
});

/**
 * @openapi
 * '/gateways':
 *  post:
 *     tags:
 *     - Create gateways
 *     summary: Create a gateway
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - ip_address
 *            properties:
 *              serial:
 *                type: string
 *              name:
 *                type: string
 *              ip_address:
 *                type: string
 *     responses:
 *      201:
 *        description: Created. Returns the new gateway
 *      400:
 *        description: Validation. IPv4 is not valid
 */
router.post('/', async function (req, res, next) {
    const name = req.body.name;
    const ip = req.body.ip_address;

    const serial = uuid.v4();
    const gateway = new Gateway({
        serial: serial,
        name: name,
        ip_address: ip
    });

    try {
        await gateway.save();
        res.status(201).send(gateway);
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).send({error: err.errors.ip_address.message});
            return;
        }
        res.status(400).send({error: 'There was an error saving the gateway'});
    }
});

/**
 * @openapi
 * '/gateways/{id}':
 *  get:
 *     tags:
 *     - Gateway details
 *     summary: Get a gateway details
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the gateway
 *        required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                serial:
 *                  type: string
 *                name:
 *                  type: string
 *                ip_address:
 *                  type: string
 *       400:
 *         description: Bad request
 */
router.get('/:id', async function (req, res, next) {
    const id = req.params.id;
    try {
        const gateway = await Gateway.findById(id);
        if (!gateway) {
            res.status(404).send({error: `Gateway with id ${id} not found`});
            return;
        }
        res.status(200).send(gateway);
    } catch (err) {
        if (err instanceof DocumentNotFoundError) {
            res.status(404).send({error: `Gateway with id ${id} not found`});
        }
        if (err instanceof CastError) {
            res.status(400).send({error: 'Invalid gateway id'});
        }
        res.status(400).send({error: 'There was a problem getting the gateway'});
    }
});

/**
 * @openapi
 * '/gateways/{id}':
 *  put:
 *     tags:
 *     - Update a gateway
 *     summary: Update a gateway
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the gateway
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - ip_address
 *            properties:
 *              serial:
 *                type: string
 *              name:
 *                type: string
 *              ip_address:
 *                type: string
 *     responses:
 *      201:
 *        description: Updated. Returns the updated gateway
 *      400:
 *        description: Validation error. IPv4 is not valid
 *      404:
 *        description: Gateway not found
 */
router.put('/:id', async function (req, res, next) {
    const id = req.params.id;
    const name = req.body.name;
    const ip = req.body.ip_address;
    const serial = req.body.serial;
    try {
        const gateway = await Gateway.findById(id);
        if (!gateway) {
            res.status(404).send(`Gateway not found`);
            return;
        }

        gateway.serial = serial;
        gateway.name = name;
        gateway.ip_address = ip;

        gateway.save();

        res.send(gateway);
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).send({error: err.errors.ip_address.message});
            return;
        }
        res.status(400).send({error: 'There was an error saving the gateway'});
    }
});

/**
 * @openapi
 * '/gateways/{id}':
 *  delete:
 *     tags:
 *     - Delete gateway
 *     summary: Remove gateway by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the gateway
 *        required: true
 *     responses:
 *      200:
 *        description: Removed
 *      400:
 *        description: Bad request
 *      404:
 *        description: Not Found
 */
router.delete('/:id', async function (req, res, next) {
    const id = req.params.id;
    const result = await Gateway.findOneAndDelete({_id: id});
    if (!result) {
        res.status(404).send(`Gateway not found`);
        return;
    }
    res.status(200).send(`Deleted gateway ${result.name}(${result.ip_address})`);
});

/**
 * @openapi
 * '/gateways/{id}/devices':
 *  get:
 *     tags:
 *     - List devices
 *     summary: Get all gateway devices
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the gateway
 *        required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  _id:
 *                    type: string
 *                  uid:
 *                    type: string
 *                  vendor:
 *                    type: string
 *                  status:
 *                    type: string
 *       400:
 *         description: Bad request
 */
router.get('/:id/devices', async function (req, res, next) {
    const id = req.params.id;
    try {
        const gateway = await Gateway.findById(id).populate('devices');
        if (!gateway) {
            res.status(404).send({error: `Gateway with id ${id} not found`});
            return;
        }
        res.status(200).send(gateway.devices);
    } catch (error) {
        if (error instanceof DocumentNotFoundError) {
            res.status(404).send({error: `Gateway with id ${id} not found`});
        }
        if (error instanceof CastError) {
            res.status(400).send({error: 'Invalid gateway id'});
        }
        res.status(400).send({error: 'There was a problem getting the gateway devices'});
    }
});

/**
 * @openapi
 * '/gateways/{id}/devices':
 *  post:
 *     tags:
 *     - Create Device
 *     summary: Create a gateway device
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the gateway
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - status
 *            properties:
 *              uid:
 *                type: string
 *              vendor:
 *                type: string
 *              status:
 *                type: string
 *     responses:
 *      201:
 *        description: Created. Returns the new gateway
 *      400:
 *        description: Validation. Status is not valid
 */
router.post('/:id/devices', async function (req, res, next) {
    const id = req.params.id;

    const uid = req.body.uid;
    const vendor = req.body.vendor;
    const status = req.body.status;

    try {
        const gateway = await Gateway.findById(id).populate('devices');
        if (!gateway) {
            res.status(404).send({error: `Gateway with id ${id} not found`});
            return;
        }
        if (gateway.devices.length >= 10) {
            res.status(400).send({error: 'A gateway can only have 10 devices associated'});
            return;
        }
        const device = new Device({
            uid: uid,
            vendor: vendor,
            status: status
        });
        device.save();
        gateway.devices.push(device);
        gateway.save();
        res.status(200).send(device);
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).send({error: error.errors.status.message});
            return;
        }
        if (error instanceof DocumentNotFoundError) {
            res.status(404).send({error: `Gateway with id ${id} not found`});
            return;
        }
        if (error instanceof CastError) {
            res.status(400).send({error: 'Invalid gateway id'});
            return;
        }
        res.status(400).send({error: 'There was a problem getting the gateway devices'});
    }
});

/**
 * @openapi
 * '/gateways/{id}/devices':
 *  put:
 *     tags:
 *     - Update Devices
 *     summary: Update a device
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the gateway
 *        required: true
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: array
 *            items:
 *             type: object
 *             properties:
 *                uid:
 *                 type: string
 *                vendor:
 *                 type: string
 *                status:
 *                 type: string
 *     responses:
 *      201:
 *        description: Updated.
 *      400:
 *        description: Validation error. IPv4 is not valid
 *      404:
 *        description: Gateway not found
 */
router.put('/:id/devices', async function (req, res, next) {
    const id = req.params.id;
    const newDevices = req.body.devices;

    try {
        const gateway = await Gateway.findById(id).populate('devices');
        if (!gateway) {
            res.status(404).send({error: `Gateway with id ${id} not found`});
            return;
        }

        // remove gateway devices missing in the request devices list
        const oldDevices = gateway.devices;
        if (newDevices.length === 0) {
            gateway.devices = [];
            await gateway.save();
            res.status(200).send();
            return;
        }
        for (const device of oldDevices) {
            const element = newDevices.find((d) => d._id.toString() === device._id.toString());
            if (!element) {
                const index = oldDevices.indexOf(device);
                oldDevices.splice(index, 1);
            }
        }

        // check if each device is in the gateway devices
        for (const device of newDevices) {
            if (device._id) {
                // if it is there, update
                if (oldDevices.find((d) => {
                    return d._id.toString() === device._id;
                })) {
                    const result = await Device.findById(device._id);
                    result.status = device.status;
                    result.uid = device.uid;
                    result.vendor = device.vendor;
                    await result.save();
                } else
                // if not, check gateway devices length, create and push a new one
                if (oldDevices.length < 10) {
                    const newDevice = new Device(device);
                    await newDevice.save();
                    oldDevices.push(newDevice);
                }
            } else if (oldDevices.length < 10) {
                const newDevice = new Device(device);
                await newDevice.save();
                oldDevices.push(newDevice);
            }
        }

        gateway.devices = oldDevices;
        await gateway.save();

        res.status(201).send();
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).send({error: error.errors.status.message});
            return;
        }
        if (error instanceof DocumentNotFoundError) {
            res.status(404).send({error: `Gateway with id ${id} not found`});
            return;
        }
        if (error instanceof CastError) {
            res.status(400).send({error: 'Invalid gateway id'});
            return;
        }
        res.status(400).send({error: 'There was a problem getting the gateway devices'});
    }
});

/**
 * @openapi
 * '/gateways/{id}/devices/{device}':
 *  get:
 *     tags:
 *     - Device details
 *     summary: Get a device details
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the gateway
 *        required: true
 *      - name: device
 *        in: path
 *        description: The unique id of the device
 *        required: true
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                _id:
 *                  type: string
 *                uid:
 *                  type: string
 *                vendor:
 *                  type: string
 *                status:
 *                  type: string
 *       400:
 *         description: Bad request
 */
router.get('/:id/devices/:device', async function (req, res, next) {
    const id = req.params.id;
    const device_id = req.params.device;

    const gateway = await Gateway.findById(id).populate('devices');
    if (!gateway) {
        res.status(404).send({error: `Gateway with id ${id} not found`});
        return;
    }

    const device = gateway.devices.find((e) => {
        return e._id.toString() === device_id;
    });
    if (!device) {
        res.status(404).send({error: `Device with id ${device_id} not found`});
        return;
    }

    res.status(200).send(device);
});

/**
 * @openapi
 * '/gateways/{id}/devices/{device}':
 *  delete:
 *     tags:
 *     - Delete Device
 *     summary: Remove gateway device by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The unique id of the gateway
 *        required: true
 *      - name: device
 *        in: path
 *        description: The unique id of the device
 *        required: true
 *     responses:
 *      200:
 *        description: Removed
 *      400:
 *        description: Bad request
 *      404:
 *        description: Not Found
 */
router.delete('/:id/devices/:device', async function (req, res, next) {
    const id = req.params.id;
    const device_id = req.params.device;

    const gateway = await Gateway.findById(id).populate('devices');
    if (!gateway) {
        res.status(404).send({error: `Gateway with id ${id} not found`});
        return;
    }

    const device = gateway.devices.find((e) => {
        return e._id.toString() === device_id;
    });
    if (!device) {
        res.status(404).send({error: `Device with id ${device_id} not found`});
        return;
    }

    const index = gateway.devices.indexOf(device);
    gateway.devices.splice(index, 1);
    gateway.save();

    res.status(200).send(`Deleted device ${device_id}`);
});

module.exports = router;
