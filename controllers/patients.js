const mongoose = require('mongoose');
const {Service,Supply,Hospital} = require('../models/service');
const Disch = require('../models/discharged_data');
const Transaction = require('../models/transaction');
const Point = require('../models/refillPoint');
const Patient = require('../models/patient');
const MoneyBox = require('../models/money_parts');
const { cloudinary } = require("../cloudinary");
const mongoosePaginate = require("mongoose-paginate-v2");
const User = require('../models/user');
const puppeteer = require('puppeteer'); 
const e = require('connect-flash');
const { copy } = require('../routes/services');
const ObjectId = mongoose.Types.ObjectId; // Importar la clase ObjectId

// const service = require('../models/services');

  
function getMexicoCityTime() {
    const now = new Date();
    const mexicoCityOffset = -6 * 60; // Mexico City is UTC-6
    const mexicoCityTime = new Date(now.getTime() + mexicoCityOffset * 60 * 1000);
    return mexicoCityTime;
  }
  
  
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

module.exports.index = async (req, res) => {
    const resPerPage = 30;
    const page = parseInt(req.params.page) || 1;
    let {search,sorted} = req.query;
    const end = getMexicoCityTime();
    const begin = new Date(end.getFullYear(), end.getMonth() - 1, end.getDate()); 
    console.log('the dates');
    console.log(begin)

    const patients = await Patient.find({admissionDate: { $gte: begin, $lte: end } })
    .sort({ discharged: 1, admissionDate: -1})
    .limit(resPerPage)
    .populate("author").populate('receivedBy');
    const count =  await Patient.countDocuments({admissionDate: { $gte: begin, $lte: end }});
    res.render('patients/index',{patients,"page":page, pages: Math.ceil(count / resPerPage),
    numOfResults: count,search:req.query.search,sorted:sorted})
}

//search for patients with keyword
module.exports.searchAllPatients = async (req, res) => {
  console.log('')
    let {search,sorted,begin,end,page} = req.query;
    page = parseInt(page)||1;
    console.log('in here!')
    console.log(end)
    let resPerPage = 30;
    search = new RegExp(escapeRegExp(search), 'gi');
    let dbQueries =  [
            { name: search },
            { treatingDoctor: search },
            { diagnosis: search },
            { description: search },
        ];
    begin = new Date(begin)
    end = new Date(end)
    let patients = [];
    const skip = resPerPage * (page - 1);

    //  = await Patient.find({$or:dbQueries,admissionDate:{$gte:begin,$lte:end}}).limit(resPerPage*3).sort({discharged: 1, admissionDate: -1}).populate("author").populate("receivedBy");

let numPatients = await Patient.countDocuments({ $or: dbQueries, admissionDate: { $gte: begin, $lte: end } });
    begin = req.query.begin;
    end = req.query.end;
    if(sorted == "name"||sorted == "Ordenar por:"){
       patients = await Patient.find({ $or: dbQueries, admissionDate: { $gte: begin, $lte: end } })
       .sort({ discharged: 1, admissionDate: 1 })
       .skip(skip)
       .limit(resPerPage)
       .populate("author")
       .populate("receivedBy");
        //sort in alphabetical order
        // patients = patients.slice(((resPerPage * page) - resPerPage),((resPerPage * page) - resPerPage)+resPerPage).sort((a,b)=>a.name.localeCompare(b.name,"es",{sensitivity:'base'}));
    };
    if(sorted == "doctor"){
        //sort in alphabetical order
        patients = await Patient.find({ $or: dbQueries, admissionDate: { $gte: begin, $lte: end } })
       .sort({ discharged: 1, admissionDate: 1 })
       .skip(skip)
       .limit(resPerPage)
       .populate("author")
       .populate("receivedBy");
        // patients = patients.slice(((resPerPage * page) - resPerPage),((resPerPage * page) - resPerPage)+resPerPage).sort((a,b)=>a.doctor.localeCompare(b.name,"es",{sensitivity:'base'}));
    };
    if(sorted == "diagnosis"){
        //sort in alphabetical order
        patients = await Patient.find({ $or: dbQueries, admissionDate: { $gte: begin, $lte: end } })
       .sort({ discharged: 1, admissionDate: 1 })
       .skip(skip)
       .limit(resPerPage)
       .populate("author")
       .populate("receivedBy");
        // patients = patients.slice(((resPerPage * page) - resPerPage),((resPerPage * page) - resPerPage)+resPerPage).sort((a,b)=>a.class.localeCompare(b.diagnosis,"es",{sensitivity:'base'}));
    };
    if (!patients) {
        res.locals.error = 'Ningun servicio corresponde a la busqueda';
        res.json({})
    }
    res.json({'patients':patients,'currentUser':res.locals.currentUser,'begin':begin,'end':end,"page":page, 'pages': Math.ceil(numPatients / resPerPage),
    'numOfResults': numPatients,'search':req.query.search,'sorted':sorted})
}


module.exports.renderNewForm = (req, res) => {
    res.render("patients/new",{'currentUser':res.locals.currentUser,'serviceType':res.locals.currentUser.serviceType});
}

module.exports.createPatient = async (req, res, next) => {
    const patient = new Patient(req.body.patient);
    const nDate = getMexicoCityTime();
    patient.author = req.user._id;
    let currUser = await User.findById(req.user._id)
    console.log('the user')
    console.log(req.body.patient.serviceType)
    currUser.serviceType = req.body.patient.serviceType;
    await currUser.save();
    patient.admissionDate = nDate;
    await patient.save();
    req.flash('success', 'Paciente creado!');
    res.redirect("/patients")
}

module.exports.createPatientConsultation = async (req, res, next) => {
    const patient = new Patient(req.body.patient);
    const nDate = getMexicoCityTime();
    patient.author = req.user._id;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
hour = nDate.getUTCHours(); // Get the hour component of the datetime
 minutes = nDate.getUTCMinutes(); // Get the minutes component of the datetime
  amOrPm = hour >= 12 ? 'PM' : 'AM'; // Determine whether the time is in the AM or PM
 formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Convert the hour to 12-hour format
 formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; 
 formattedTime = `${formattedHour}:${formattedMinutes} ${amOrPm}`; 
 formattedMonth = nDate.getUTCMonth() <10?`0${nDate.getUTCMonth()}`:nDate.getUTCMonth();
 formattedDay = nDate.getUTCDate() <10?`0${nDate.getUTCDate()}`:nDate.getUTCDate();
    patient.name = 'Paciente: '+req.body.patientName+'. Consulta: '+req.user.username+' '+formattedDay+'/'+formattedMonth+'/'+nDate.getUTCFullYear()+" - "+formattedTime;
    patient.cuarto = 'Consultorio';
    patient.treatingDoctor = req.user.username;
    patient.diagnosis = 'Consulta'
    patient.serviceType = 'Consulta'
    patient.admissionDate = nDate;
    await patient.save();
    req.flash('success', 'Nueva consulta');
    res.redirect(`/patients/${patient.id}`)
}

module.exports.createPharmacySale= async (req, res, next) => {
    const patient = new Patient(req.body.patient);
    const nDate = getMexicoCityTime();
    patient.author = req.user._id;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    hour = nDate.getUTCHours(); // Get the hour component of the datetime
    minutes = nDate.getUTCMinutes(); // Get the minutes component of the datetime
    amOrPm = hour >= 12 ? 'PM' : 'AM'; // Determine whether the time is in the AM or PM
    formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Convert the hour to 12-hour format
    formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; 
    formattedTime = `${formattedHour}:${formattedMinutes} ${amOrPm}`; 
    formattedMonth = nDate.getUTCMonth() <10?`0${nDate.getUTCMonth()}`:nDate.getUTCMonth();
    formattedDay = nDate.getUTCDate() <10?`0${nDate.getUTCDate()}`:nDate.getUTCDate();
    patient.name = 'Venta de Farmacia:  '+req.user.username+' '+formattedDay+'/'+formattedMonth+'/'+nDate.getUTCFullYear()+" - "+formattedTime;
    patient.cuarto = 'Farmacia';
    patient.treatingDoctor = ' ';
    patient.diagnosis = 'Farmacia';
    patient.serviceType = 'Consulta'
    patient.admissionDate = nDate;
    await patient.save();
    req.flash('success', 'Venta de farmacia creada');
    res.redirect(`/patients/${patient.id}`)
}


module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
        req.flash('error', 'Error al buscar paciente!');
        return res.redirect('/patients');
    }
    res.render("patients/edit", { patient });
}


module.exports.updatePatient = async (req, res) => {
    const { id } = req.params;
    req.body.patient.admissionDate = new Date(req.body.patient.admissionDate+':00.000Z');
    const patient = await Patient.findByIdAndUpdate(id, { ...req.body.patient });
    await patient.save();
    req.flash('success', 'Paciente actualizado correctamente!');
    res.redirect(`/patients`)
}



module.exports.updatePayedPatient = async (req, res) => {
  const { id } = req.params;
  const patient = await Patient.findById(id).populate({
    path: 'servicesCar',
    populate: [
      { path: 'relatedBox', populate: { path: 'dependantMoneyBoxes' } },
      { path: 'service' },
    ],
  });
  for(transaction of patient.servicesCar){
    moneyBox = transaction.relatedBox;
    if(moneyBox.dependantMoneyBoxes.length > 0){
          for (const dependentBox of moneyBox.dependantMoneyBoxes) {
              dependentBox.transactionsActive.push(transaction)
              await dependentBox.save()
              for (const rootDependantBox of dependentBox.dependantMoneyBoxes) {
                  rootDependantBox.transactionsActive.push(transaction)
                  await rootDependantBox.save()
              }
          }
      }
    moneyBox.transactionsActive.push(transaction);
    await moneyBox.save()
} 
  patient.payed = true;
  patient.chargedDate = getMexicoCityTime();
  patient.receivedBy = req.user;
  patient.totalReceived = req.body.totalCharged;
  await patient.save();
  req.flash('success', 'Cuenta cobrada!');
  res.redirect(`/patients/${patient.id}?redirected=true`);
}

module.exports.dischargePatient = async (req, res) => {
    const { id } = req.params;
    const patient = await Patient.findById(id).populate({
        path: 'servicesCar',
        populate: {
          path: 'service',
        },
      });
    //variable for local time 
    const nDate = getMexicoCityTime();
    patient.discharged = true
    patient.dischargedDate = nDate;
    //create discharged data
    for(let trans of patient.servicesCar){
        console.log('the trans when discharged')
        console.log(trans)
        let dischargedData = {
            patient:trans.patient,
            class: trans.service.class,
            amount: trans.amount,
            name: trans.service.name,
            service_type: trans.service.service_type,
            processDate: nDate,
            discount:trans.discount,
            hospitalEntry:trans.service.hospitalEntry,
            unitPrice: trans.service.sell_price||trans.service.price,
            buyPrice: trans.service.buy_price||0

        }
        let dischargedField = new Disch(dischargedData);
        console.log('discharged data')
        console.log(dischargedField)
        trans.discharged_data = dischargedField;
        await trans.save();
        await dischargedField.save();
    }
    await patient.save();
    req.flash('success', 'Paciente dado de alta!');
    res.redirect(`/patients`)
}


module.exports.activatePatient = async (req, res) => {
  const { id } = req.params;
  const patient = await Patient.findById(id).populate({
      path: 'servicesCar',
      populate: {
        path: 'service',
      },
    });
  //variable for local time 
  patient.discharged = false
  await patient.save();
  req.flash('success', 'Paciente activado!');
  res.redirect(`/patients`)
}

module.exports.deletePatient = async (req, res) => {
    const { id } = req.params;
    try {
      const populatedPatient = await Patient.findById(id).exec();
      await populatedPatient
        .populate({
          path: 'servicesCar',
          populate: {
            path: 'service',
          },
        })
        if(populatedPatient && populatedPatient.servicesCar){
          const servicesCar = populatedPatient.servicesCar;
          for (let serv of servicesCar) {
            console.log('the serice')
            console.log(serv)
            if (serv.service.service_type === 'supply') {
                console.log('resuppp')
              serv.service.stock += serv.amount;
              await serv.service.save();
            }
          }
  
          let id_arr = servicesCar.map((el) => el._id);
          await Transaction.deleteMany({
            _id: {
              $in: id_arr
            }
          });
          await MoneyBox.updateMany(
            { transactionsActive: { $in: id_arr } },
            { $pull: { transactionsActive: { $in: id_arr } } }
          );
        }
        await Patient.findByIdAndDelete(id);
      req.flash('success', 'Paciente eliminado correctamente');
      res.redirect('/patients');
    } catch (error) {
      console.error(error);
      req.flash('error', 'Error al eliminar el paciente');
      res.redirect('/patients');
    }
  };

module.exports.showPatient = async (req, res) => {
    console.log('show patient')
    let {begin,bH,end,eH} = req.query;
    let pat = await Patient.findById(req.params.id);
    let boxes = await MoneyBox.find({});
    //variable for local time 
    const nDate = getMexicoCityTime();
    if(!begin){
        begin = pat.admissionDate;
    }else{
        begin = new Date(begin+"T"+bH+"Z");
    };
    if(!end){
        end= nDate;
    }else{
        end = new Date(end+"T"+eH+"Z");
    };
    const patient = await Patient.findById(req.params.id).populate({
        path: 'servicesCar',
        populate: {
          path: 'service addedBy relatedBox',
        },
      })
    let new_car = patient.servicesCar.map((el)=>{
        if(["Dia","Hora"].includes(el.service.unit) && el.toggle){
            el.terminalDate = nDate;
            let start = new Date(el.consumtionDate);
            end = nDate;
            //calculate the unit time in miliseconds
            let miliUnit = (el.service.unit == "Dia")?(86400*1000):(3600*1000);
        //divide the difference between start and end batween the miliseconds unit
            let new_amount = (end.getTime() - start.getTime())/miliUnit;
            new_amount = Math.round(new_amount * 100) / 100;
            el.amount = new_amount;
            el.save()
            return el;
        }else{
                return el
        }
    })

    await patient.save();
    const str_id = JSON.stringify(patient._id); 
    if (!patient) {
        req.flash('error', 'No se encontro paciente!');
        return res.redirect('/patients');
    }
    let timePoint = await Point.findOne({name:"datePoint"});

    let redirected = req.query.redirected || false;

    res.render(`patients/show`, { patient, str_id,begin,end,eH,bH,boxes,'flag':redirected,'resupplying':timePoint.resupplying,'role':req.query.role});
}


module.exports.showDischargedPatient= async (req, res) => {
    const patient = await Patient.aggregate([  
        {$match: {_id:  new ObjectId(req.params.id)}}, 
        {$group: {
            _id:"$name",
            patientName:{$last:"$name"},
            treatingDoctor:{$last:"$treatingDoctor"},
            servicesCar:{$last:"$servicesCar"},
            diagnosis: {$last:"$diagnosis"},
            admissionDate: { $last:"$admissionDate"}}},
        {$unwind:"$servicesCar"},
        {
            $lookup: {
            from: "transactions",
            localField: "servicesCar",    
            foreignField: "_id",  
            as: "fromTransaction"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$fromTransaction", 0 ] }, "$$ROOT" ] } }
        },
        {$match: {discharged_data:{$exists: true, $ne: null }}},
        {
            $lookup: {
            from: "disches",
            localField: "discharged_data",    // field in current collection
            foreignField: "_id",  // field foreign
            as: "fromDischarged"
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$fromDischarged", 0 ] }, "$$ROOT" ] } }
        },
        {$group: {
            _id: { name:"$name", discount: "$discount" }, // Group by name and discount
            patientName:{$last:"$patientName"},
            class:{$last:"$class"},
            name: {$last:"$name"},
            treatingDoctor:{$last:"$treatingDoctor"},
            diagnosis : {$last:"$diagnosis"},
            admissionDate : {$last:"$admissionDate"},
            discount: { $last: "$discount"}, // Add discount
            price: {$last:"$unitPrice"},
            amount: { $sum:"$amount"}}},
        {$group: {
            _id:"$class",
            patientName:{$last:"$patientName"},
            class:{$last:"$class"},
            serviceName: {$push:"$name"},
            treatingDoctor:{$last:"$treatingDoctor"},
            diagnosis : {$last:"$diagnosis"},
            admissionDate : {$last:"$admissionDate"},
            discount: { $push: "$discount"}, // Add discount
            price: {$push:"$price"},
            amount: { $push:"$amount"}}},
        {$addFields:{totalPrice : { $sum: "$price" }}},
        {$addFields:{totalCost : { $sum: "$cost" }}},
    ]).collation({locale:"en", strength: 1});
    console.log('show discharged');
    console.log(patient)
    res.render(`patients/dischargedPatient`, {patient});
}


module.exports.patientAccount = async (req, res) => {
  console.log('inside patient account')
  let {begin,end} = req.query;
  try{
  let pat = await Patient.findById(req.params.id);
  //variable for local time 
  const nDate = getMexicoCityTime();
  if(!begin){
      begin = pat.admissionDate
  }else{
      begin = new Date(begin+"T00:00:01.000Z");
  };
  if(!end){
      end= nDate;
  }else{end = new Date(end+"T23:59:01.000Z")};
  const patient = await Patient.aggregate([   
      // put in a single document both transaction and service fields
      {$match: {_id:  new ObjectId(req.params.id)}},
      {$group: {
          _id:"$name",
          patientName:{$last:"$name"},
          treatingDoctor:{$last:"$treatingDoctor"},
          servicesCar:{$last:"$servicesCar"},
          rfc : {$last:"$rfc"},
          diagnosis: {$last:"$diagnosis"},
          admissionDate: { $last:"$admissionDate"}}},
      {$unwind:"$servicesCar"},
      {
          $lookup: {
             from: "transactions",
             localField: "servicesCar",    
             foreignField: "_id",  
             as: "fromTransaction"
          }
       },
       {
          $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$fromTransaction", 0 ] }, "$$ROOT" ] } }
       },
       { $project: { fromTransaction: 0, servicesCar:0 } },
      {$match: {consumtionDate:{$gte:begin,$lte:end}}},
      {
          $lookup: {
             from: "services",
             localField: "service",
             foreignField: "_id",
             as: "fromService"
          }
       },
       {
          $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$fromService", 0 ] }, "$$ROOT" ] } }
       },
       { $project: { fromService: 0 } },
       {$group: {
          _id: { name:"$name", discount: "$discount", service_type: "$service_type" }, // Group by name and discount
          patientName:{$last:"$patientName"},
          class:{$last:"$class"},
          name: {$last:"$name"},
          unit: {$last:"$unit"},
          treatingDoctor:{$last:"$treatingDoctor"},
          service_type : {$last:"$service_type"},
          rfc : {$last:"$rfc"},
          diagnosis : {$last:"$diagnosis"},
          admissionDate : {$last:"$admissionDate"},
          price: {$last:"$price"},
          cost: {$last:0},
          expiration: { $push:"$expiration"},
          sell_price: { $last:"$sell_price"},
          buy_price: { $last: "$buy_price"},
          discount: { $last: "$discount"}, // Add discount
          amount: { $sum:"$amount"}}},
       {
          $lookup: {
             from: "services",
             localField: "service",
             foreignField: "_id",
             as: "fromService"
          }
       },
  {
    $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$fromService", 0 ] }, "$$ROOT" ] } }
       },
       { $project: { fromService: 0 } },
      {$group: {
          _id: { class:"$class", service_type: "$service_type" }, // Group by name and discount
          patientName:{$last:"$patientName"},
          class:{$last:"$class"},
          serviceName: {$push:"$name"},
          treatingDoctor:{$last:"$treatingDoctor"},
          service_type : {$last:"$service_type"},
          rfc : {$last:"$rfc"},
          diagnosis : {$last:"$diagnosis"},
          admissionDate : {$last:"$admissionDate"},
          price: {$push:"$price"},
          cost: {$push:0},
          service_unit:{$push:"$unit"},
          discount: { $last: "$discount"}, // Add discount
          expiration: { $push:"$expiration"},
          sell_price: { $push:"$sell_price"},
          buy_price: { $push: "$buy_price"},
          amount: { $push:"$amount"}}},
      {$addFields:{totalSell : { $sum: "$sell_price" }}},
      {$addFields:{totalBuy : { $sum: "$buy_price" }}},
      {$addFields:{totalPrice : { $sum: "$price" }}},
      {$addFields:{totalCost : { $sum: "$cost" }}},
  ]).collation({locale:"en", strength: 1});
  if (!patient) {
      req.flash('error', 'No se encontro paciente!');
      return res.redirect('/patients');
  }
  begin = req.query.begin;
  end = req.query.end;
  console.log('role-----')
  console.log(req.query);
  patient.sort((a,b)=>a.class.localeCompare(b.class,"es",{sensitivity:'base'}))
  console.log('el usuario')
  res.render(`patients/showAccount`, { patient,begin,end,'role':req.query.role});
}catch(e){console.log('Errores');
console.log(e)}
}


module.exports.accountToPDF = async (req,res) =>{ 
    let {begin,end,name,role} = req.query;               
    // const browser = await puppeteer.launch();       // run browser
    
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreDefaultArgs: ['--disable-extensions'],
    headless: 'new' // Use the new Headless mode
  });

  const page = await browser.newPage();
  await page.goto(
    `https://clinicaabasolo2-production.up.railway.app/patients/${req.params.id}/showAccount?begin=${begin}&end=${end}&role=${role}`,
    { waitUntil: 'networkidle0' }
    // `http://localhost:3000/patients/${req.params.id}/showAccount?begin=${begin}&end=${end}`,
    // { waitUntil: 'networkidle0' }
  );

  const dom = await page.$eval('.toPDF', (element) => {
    return element.innerHTML;
  });

  await page.setContent(dom);
  await page.addStyleTag({ url: 'https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css' });
  await page.addStyleTag({
    content: `.image_print {
      position: absolute;
      top: 10px;
      left: 200px;
      width: 200px;
      height: 100px;
    }
    .subRed {
      font-size: 70% !important;
      line-height: 1 !important;
    }
    .reduced {
      font-size: 60% !important;
      line-height: 1 !important;
    }`
  });

  const pdf = await page.pdf({ landscape: false });
  await browser.close();

  res.contentType('application/pdf');
  res.send(pdf);
};

module.exports.dischAccountPDF = async (req,res) =>{ 
   
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreDefaultArgs: ['--disable-extensions'],
        headless: 'new' // Use the new Headless mode
      });    
      const page = await browser.newPage();           // open new tab
    
    // await page.goto(`https://pure-brushlands-42473.herokuapp.com/patients/${req.params.id}/showAccount?begin=${begin}&end=${end}`,{
    //     waitUntil: 'networkidle0'}); 
    await page.goto(`https://clinicaabasolo2-production.up.railway.app/patients/${req.params.id}/showDischarged`,{
        waitUntil: 'networkidle0'});          // go to site
    // await page.goto(
    //     `http://localhost:3000/patients/${req.params.id}/showDischarged`,{
    //       waitUntil: 'networkidle0'});

    const dom = await page.$eval('.toPDF', (element) => {
        return element.innerHTML
    }) // Get DOM HTML
    await page.setContent(dom)   // HTML markup to assign to the page for generate pdf
    await page.addStyleTag({url: "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css"});
    await page.addStyleTag({content: `.image_print{
            position:absolute;
            top:10px;
            left:200px;
            width:200px;
            height: 100px;
        }
        .subRed {
            font-size: 70% !important;
            line-height: 1 !important;
          }
            .reduced {
                font-size: 60% !important;
                line-height: 1 !important;
              }`})
    const pdf = await page.pdf({landscape: false})
    await browser.close(); 
    res.contentType("application/pdf");
    res.send(pdf);
}


//search supplies from patient account
module.exports.search_3 = async (req, res) => {
        let {search} = req.query;
        search = new RegExp(escapeRegExp(search), 'gi');
        const dbQueries =  [
            { name: search },
            { class: search },
            { principle: search },
            { description: search },
        ];
        
        let supplies = await Service.find({$or:dbQueries,deleted:false}).limit(5);
		if (!supplies) {
			res.locals.error = 'No results match that query.';
        }
        res.json(supplies);
}



function getDaysInMonthUTC(month, year) {
    var date = new Date(Date.UTC(year, month, 1));
    var days = [];
    while (date.getUTCMonth() === month) {
      days.push(new Date(date));
      date.setUTCDate(date.getUTCDate() + 1);
    }
    return days;
  }
  
module.exports.searchAll = async (req, res) => {
    let {search,exp} = req.query;
        search = new RegExp(escapeRegExp(search), 'gi');
        const dbQueries =  [
            { name: search },
            { class: search },
            { principle: search },
            { description: search },
        ];
        let supplies = [];
        if(exp){
            expirations = [];
            exp = new Date(exp);
            expirations = getDaysInMonthUTC(exp.getUTCMonth(),exp.getUTCFullYear());
            supplies = await Service.find({$or:dbQueries,deleted:false,expiration:{$in:expirations}});
        }else{
            supplies = await Service.find({$or:dbQueries,deleted:false});
        }
		if (!supplies) {
			res.locals.error = 'Ningun producto corresponde a la busqueda';
        }
		res.json(supplies);
}

module.exports.addToCart = async (req, res) => {
    let timePoint = await Point.findOne({name:"datePoint"});
    const patient = await Patient.findById(req.params.id);
    
    box = await MoneyBox.findById(req.body.moneyBoxId);

    var service;
    if(req.body.mode == 'pistol'){
          service = await Service.findOne({barcode:req.body.service});
          console.log('service found')
          console.log(service)
    }else{
        service = await Service.findById(req.body.service);
    }
    if(!timePoint.resupplying || (service.service_type != 'supply')){
    const timeUnits =  ["Hora", "Dia"];
    //variable for local time 
    const nDate = getMexicoCityTime();
    let termDate = nDate;
    let amnt = 0;
    if(!timeUnits.includes(service.unit)){
        amnt = parseInt(req.body.addAmount);
    }
    console.log('body')
    console.log(req.body)
    
    const transaction = new Transaction({
        patient: patient,
        service:service,
        amount:amnt,
        consumtionDate:nDate,
        addedBy:req.user,
        location:req.body.location,
        terminalDate:termDate,
        relatedBox: box._id
    });

    if(service.service_type == "supply"){
        if((service.stock - req.body.addAmount) < 0 ){
            return res.send({ msg: "False",serviceName:`${service.name}`});
        }else{
            service.stock = service.stock-req.body.addAmount;
            timePoint.servicesCar.push(transaction);
        }
    }
    patient.servicesCar.push(transaction);
    try{
    await transaction.save();
    await timePoint.save();
    await patient.save();
    //Remove supply from the inventory
    await service.save();
       
    return res.send({ msg: "True",serviceName:`${service.name}`,patientName:`${patient.name}`});

}catch(e){
    console.log('error')
    console.log(e)
}
}else{
    return res.send({ msg: "Paused"});
}
}

module.exports.deleteServiceFromAccount = async (req, res) => {
    console.log('called delete from account')
    try{
    const service = await Service.findById(req.body.serviceID);
    const begin = new Date(req.body.begin+"T00:00:01.000Z");
    const end = new Date(req.body.end+"T23:59:01.000Z");
    const patient = await Patient.findByIdAndUpdate(req.params.id,{$pull:{servicesCar:{_id:req.body.trans_id}}}).populate({
        path: 'servicesCar',
        populate: {
          path: 'service',
        },
      });
    const moneyBox = await MoneyBox.findByIdAndUpdate(req.body.moneyBoxId,{$pull:{transactionsActive:{_id:req.body.trans_id}}})
    let trans =  await Transaction.findByIdAndDelete(req.body.trans_id);
    let timePoint;
    if(service.service_type=="supply"){
        service.stock += parseInt(req.body.amount)
        
    }
    timePoint = await Point.findOneAndUpdate({name:"datePoint"},{$pull:{servicesCar:{_id:req.body.trans_id}}}).populate({
        path: 'servicesCar',
        populate: {
          path: 'service',
        },
      });
    await moneyBox.save();
    await service.save()
    await patient.save();
    await timePoint.save()
    req.flash('success', 'Producto borrado!');
    return res.send({msg:"True"});
}catch(e){
    console.log('error')
    console.log(e)
}
}


module.exports.editDiscountFromAccount = async (req, res) => {
    try{
    const patient = await Patient.findById(req.params.id);
    const transaction = await Transaction.findByIdAndUpdate(
      req.body.trans_id,
      { discount: req.body.discount }, // Update the discount field with the new value
    );
    await transaction.save()
    await patient.save();
    return res.send({ msg: "True",serviceName:`sini`,patientName:`${patient.name}`});
    }catch(e){
        console.log('error')
        console.log(e)
    }
};

module.exports.editMoneyBox = async (req, res) => {
    console.log('inside edit money box')
    console.log(req.body)
    try {
      const patient = await Patient.findById(req.params.id);
      const { trans_id, moneyBox } = req.body; // Assuming the data is sent in the request body
  
      // Find the transaction by its ID
      const transaction = await Transaction.findById(trans_id);
  
      if (!transaction) {
        return res.status(404).send({ msg: "Transaction not found" });
      }
  
      // Remove the transaction from any other box it was related to
      // const previousBoxId = transaction.relatedBox;
      // if (previousBoxId) {
      //   const previousBox = await MoneyBox.findById(previousBoxId);
      //   if (previousBox) {
      //     previousBox.transactionsActive = previousBox.transactionsActive.filter(
      //       (transactionId) => transactionId.toString() !== trans_id
      //     );
      //     await previousBox.save();
      //     await removeTransactionFromHierarchy(previousBox, transaction);
      //   }
      // }
  
      // Update the relatedBox field with the new moneyBox value
      transaction.relatedBox = moneyBox;
  
      // Add the transaction to the activeTransactions of the new box
      const newBox = await MoneyBox.findById(moneyBox);
      // if (newBox) {
      //   await addTransactionToHierarchy(newBox, transaction);
      // }
  
      await transaction.save();
      await patient.save();
  
      return res.send({
        msg: "True",
        serviceName: "sini",
        patientName: patient.name,
      });
    } catch (e) {
      console.log('error');
      console.log(e);
      return res.status(500).send({ msg: "Internal server error" });
    }
  };


  module.exports.editAllMoneyBoxes = async (req, res) => {
    console.log('inside edit all money box');
    console.log(req.body);
    
    try {
      const patient = await Patient.findById(req.params.id).populate('servicesCar');
      const { moneyBox } = req.body; // Assuming the data is sent in the request body
  
      // Find all transactions related to the patient
      const transactions = patient.servicesCar;
  
      // Iterate through each transaction and update their relatedBox field
      for (const trans of transactions) {
        console.log('the trans')
        console.log(trans._id.toString())
        const transaction = await Transaction.findById(trans._id.toString());
        // console.log('the transaction')
        // console.log(transaction)
        // // Remove the transaction from any other box it was related to
        // const previousBoxId = transaction.relatedBox;
        // if (previousBoxId) {
        //   const previousBox = await MoneyBox.findById(previousBoxId);
        //   if (previousBox) {
        //     previousBox.transactionsActive = previousBox.transactionsActive.filter(
        //       (transactionId) => transactionId.toString() !== transaction._id.toString()
        //     );
        //     await previousBox.save();
        //     await removeTransactionFromHierarchy(previousBox, transaction);
        //   }
        // }
  
        // Update the relatedBox field with the new moneyBox value
        transaction.relatedBox = moneyBox;
  
        // Add the transaction to the activeTransactions of the new box
        const newBox = await MoneyBox.findById(moneyBox);
        if (newBox) {
          await addTransactionToHierarchy(newBox, transaction);
        }
  
        await transaction.save();
      }
  
      await patient.save();
  
      return res.send({
        msg: "True",
        serviceName: "sini",
        patientName: patient.name,
      });
    } catch (e) {
      console.log('error');
      console.log(e);
      return res.status(500).send({ msg: "Internal server error" });
    }
  };

async function removeTransactionFromHierarchy(box, transaction) {
    box.transactionsActive = box.transactionsActive.filter(
      (transactionId) => transactionId.toString() !== transaction._id.toString()
    );
  
    await box.save();
  
    for (const dependentBoxId of box.dependantMoneyBoxes) {
      const dependentBox = await MoneyBox.findById(dependentBoxId);
      if (dependentBox) {
        await removeTransactionFromHierarchy(dependentBox, transaction);
      }
    }
  }
  
  async function addTransactionToHierarchy(box, transaction) {
    box.transactionsActive.push(transaction._id);
    await box.save();
  
    for (const dependentBoxId of box.dependantMoneyBoxes) {
      const dependentBox = await MoneyBox.findById(dependentBoxId);
      if (dependentBox) {
        await addTransactionToHierarchy(dependentBox, transaction);
      }
    }
  }


module.exports.updateServiceFromAccount = async (req, res) => {
  let timePoint = await Point.findOne({name:"datePoint"});
  console.log('BODY');

  console.log(req.body);
  if(!timePoint.resupplying){
  try{
  const service = await Service.findById(req.body.serviceID);
  const nDate = getMexicoCityTime()
  const patient = await Patient.findByIdAndUpdate(req.params.id,{$pull:{servicesCar:{_id:req.body.trans_id}}}).populate({
      path: 'servicesCar',
      populate: {
        path: 'service',
      },
    });
  const moneyBox = await MoneyBox.findByIdAndUpdate(req.body.moneyBoxId,{$pull:{transactionsActive:{_id:req.body.trans_id}}})
  const req_amount = req.body.amount;
  let transact = await Transaction.findById(req.body.trans_id);
  let location = transact.location;
  const difference = transact.amount - req_amount;
  if(difference<0){
      if(service.service_type == "supply"){
          if((service.stock - Math.abs(difference)) < 0 ){
              return res.send({ msg: "False",serviceName:`${service.name}`});
          }else{
              service.stock = service.stock - Math.abs(difference);
          }
      }
  }else{
      service.stock = service.stock + Math.abs(difference);
  }
  const new_trans = new Transaction({patient: patient,relatedBox:moneyBox,service:service,amount:req_amount,location:location,consumtionDate:nDate,addedBy:req.user});
  if(service.service_type == "supply"){
      let timePoint = await Point.findOneAndUpdate({name:"datePoint"},{$pull:{servicesCar:{_id:req.body.trans_id}}}).populate({
          path: 'servicesCar',
          populate: {
            path: 'service',
          },
        });
        timePoint.servicesCar.push(new_trans);
        await timePoint.save();
  }
  await Transaction.deleteMany({_id:req.body.trans_id});
  patient.servicesCar.push(new_trans);
  moneyBox.transactionsActive.push(new_trans);
  await new_trans.save();
  //Remove supply from the inventory
  await service.save();
  await patient.save();
  //update transactions (delete all transactions with that service and create a new one with new amount)
  return res.send({ msg: "True",serviceName:`${service.name}`,patientName:`${patient.name}`});
  }catch(e){
      console.log('error')
      console.log(e)
  }}
  else{
      return res.send({ msg: "Paused"});
  }
}



module.exports.updateTimeService = async (req, res) => {
    const service = await Service.findById(req.body.serviceID);
    const patient = await Patient.findById(req.params.id);
    const nDate = getMexicoCityTime();
    // let transact = await Transaction.findById(req.body.trans_id);
    let toggle = req.body.toggle == "true";
    let start = new Date(req.body.start+":01.000Z"),
        end = (toggle)?nDate:new Date(req.body.until+":01.000Z");
    //calculate the unit time in miliseconds
    let miliUnit = (service.unit == "Dia")?(86400*1000):(3600*1000);
    //divide the difference between start and end batween the miliseconds unit
    let new_amount = (end.getTime() - start.getTime())/miliUnit;
    new_amount = Math.round(new_amount * 100) / 100;
    await Transaction.deleteMany({_id:req.body.trans_id});
    const transaction = new Transaction({
        patient: patient,
        service:service,
        amount:new_amount,
        consumtionDate:start,
        addedBy:req.user,
        terminalDate:end,
        toggle:toggle
    });
    patient.servicesCar.push(transaction);
    await transaction.save()
    //Remove supply from the inventory
    await patient.save();
    //update transactions (delete all transactions with that service and create a new one with new amount)
    return res.send({ msg: "True",serviceName:`${service.name}`,patientName:`${patient.name}`});
}