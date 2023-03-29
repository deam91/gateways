const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {CastError, DocumentNotFoundError, ValidationError} = mongoose.Error;
const uuid = require('uuid');


const Gateway = require('../schemas/gateway');
const Device = require('../schemas/device');

/* GET gateways listing. */
router.get('/', async function (req, res, next) {
    const query = Gateway.find().populate('devices');
    query.collection(Gateway.collection);
    await query.exec().then((data) => {
        res.send(data);
    }, (err) => {
        console.log(err);
    });
});

/* POST new gateway. */
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
        res.send(gateway);
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).send({error: err.errors.ip_address.message});
            return;
        }
        res.status(400).send({error: 'There was an error saving the gateway'});
    }
});

/* GET gateways details. */
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

/* PUT new gateway. */
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

/* DELETE delete gateway. */
router.delete('/:id', async function (req, res, next) {
    const id = req.params.id;
    const result = await Gateway.findOneAndDelete({_id: id});
    if (!result) {
        res.status(404).send(`Gateway not found`);
        return;
    }
    res.status(200).send(`Deleted gateway ${result.name}(${result.ip_address})`);
});

/* GET gateway devices listing. */
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

/* POST new device for a gateway. */
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

/* POST new device for a gateway. */
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

        res.status(200).send();
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

/* GET gateway device details. */
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

/* DELETE delete gateway device. */
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
