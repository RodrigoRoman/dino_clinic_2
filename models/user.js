const mongoose = require('mongoose'),     
 MoneyBox = require('./money_parts'),
 Schema = mongoose.Schema;
 const ObjectId = mongoose.Types.ObjectId; // Importar la clase ObjectId


const passportLocalMongoose = require('passport-local-mongoose');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const UserSchema = new Schema({
    photo: [ImageSchema],
    email: {
        type: String,
        required: true,
        unique: true
    },
    role:{
        type: String,
        required: true
    },
    stockLocation:{
        type: String,
        default:'Central'
    },
    serviceType:{
        type: String,
        default:'Consulta'
    },
    color: {
        type: String,
        default: '#4a81e8' // default color value (black)
    },
    moneyBox: {
        type: Schema.Types.ObjectId,
        ref: 'MoneyBox',
        default: new ObjectId("6494d3dde66aeb637ba60652")
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);