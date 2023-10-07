const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

// https://res.cloudinary.com/douqbebwk/image/upload/w_300/v1600113904/YelpCamp/gxgle1ovzd2f3dgcpass.png

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const ServiceSchema = new Schema({
    name:{ type: String, required: true },
    class: { type: String,defalut:''},
    images: [ImageSchema],
    unit: {type: String,defalut:'pieza'},
    claveSat: { type: Number,defalut:''},
    description: {type: String,defalut:''},
    hospitalEntry: {type: String,required:true},
    deleted:{type: Boolean,default:false},
    barcode:{type: String,default:''},
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  }
  }, 
  { discriminatorKey: 'type' }
  );


// definition of discriminators (subclasses of the main schema)
const SupplySchema = new Schema({
    service_type: { type: String, default: 'supply' },
    principle: { type: String,required:true },
    buy_price: { type: Number, required: true, get: p => `${p}` },
    sell_price: { type: Number, required: true, get: p => `${p}` },
    expiration: { type: Date, default: Date.now},
    supplier : { type: String, required: true},
    optimum : {type: Number, required: true},
    outside : {type: Number, required: true},
    stock : {type: Number, required: true}
  });

  
  
const HospitalSchema = new Schema({
    service_type: { type: String, default: 'hospital' },
    price: { type: Number, required: true, get: p => `${p}` },
    doctor: { type: String},
  });

const Service = mongoose.model('Service', ServiceSchema);
const Supply = Service.discriminator('Supply', SupplySchema);
const Hospital = Service.discriminator('Hospital', HospitalSchema);

module.exports = {Service, Supply,Hospital}