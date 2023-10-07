const mongoose = require('mongoose'),
      {Service} = require('./service'),
      Transaction = require('./transaction'),
      Schema = mongoose.Schema
      ;

const ObjectId = mongoose.Types.ObjectId; // Importar la clase ObjectId

const PatientSchema = new Schema({
    name: { type: String, required:true },
    phone: { type: Number},
    cuarto:{type:String},
    payed:{type:Boolean, default: false},
    edad:{type:Number},
    email: { type: String},
    address: { type: String},
    rfc: { type: String },
    diagnosis: { type: String},
    treatingDoctor: { type: String },
    serviceType: { type: String,default:'Hospitalizacion'},
    admissionDate: { type: Date, default: Date.now},
    chargedDate: { type: Date, default: Date.now},
    discharged: { type: Boolean, default: false},
    dischargedDate:{ type: Date},
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: new ObjectId("63640be2ce8a1000145ce90a")
    },
    receivedBy: {
        type: Schema.Types.ObjectId,
        
        ref: 'User',
        default: new ObjectId("63640be2ce8a1000145ce90a")

    },
    totalReceived:{type:Number, default:0.0},
    servicesCar: [ {
            type: Schema.Types.ObjectId,
            ref: "Transaction"
        }
    ]
});

module.exports = mongoose.model("Patient", PatientSchema)

