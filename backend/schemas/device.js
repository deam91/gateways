const mongoose = require('mongoose');

const { Schema } = mongoose;
const String = Schema.Types.String;

const deviceSchema = new Schema({
    uid: String,
    vendor: String,
    status: {
        type: String,
        validate: {
            validator: function(v) {
                return v === 'online' || v === 'offline';
            },
            message: props => `${props.value} is not a valid status!`
        },
        required: [true, 'Status required']
    },
}, { timestamps: true });

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
