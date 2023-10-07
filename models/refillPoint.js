const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const PointSchema = new Schema({
    name:{type:String},
    setPoint: { type:Date },
    servicesCar: [ {
        type: Schema.Types.ObjectId,
        ref: "Transaction"
     },
    ],
    resupplying:{type:Boolean, default: false},
    });

module.exports = mongoose.model("Point", PointSchema)