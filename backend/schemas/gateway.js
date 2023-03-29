const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const String = Schema.Types.String;

const gatewaySchema = new Schema({
    serial: String,
    name: String,
    ip_address: {
        type: String,
        validate: {
            validator: function(v) {
                return /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/.test(v);
            },
            message: props => `${props.value} is not a valid IPv4 address!`
        },
        required: [true, 'IPv4 address required']
    },
    devices: [
        {
            type: ObjectId,
            ref: 'Device',
            default: []
        }
    ]
}, { timestamps: true });

const Gateway = mongoose.model('Gateway', gatewaySchema);

module.exports = Gateway;
