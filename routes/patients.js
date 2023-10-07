const express = require('express');
const router = express.Router();
const patients = require('../controllers/patients');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn,editDiscountFromAccount, isServAuthor,isDinamicDirectAdmin,isDirectAdminOrCaja, validateService, validateSupply, validateHospital,validatePatient} = require('../middleware');
const multer = require('multer');
const Patient = require('../models/patient');


router.route('/')
    .get(isLoggedIn,catchAsync(patients.index))
    .post(isLoggedIn, validatePatient, catchAsync(patients.createPatient))

//retrieve patients
router.get('/searchPatients',isLoggedIn,catchAsync(patients.searchAllPatients))


router.get('/new', isLoggedIn, patients.renderNewForm)

router.post('/newConsultation', isLoggedIn, patients.createPatientConsultation)
router.get('/newPharmacySale',isLoggedIn, patients.createPharmacySale)

router.put('/:id/updateDiscount', patients.editDiscountFromAccount)

router.put('/:id/updateMoneyBox', patients.editMoneyBox)

router.put('/:id/updateAllMoneyBox', patients.editAllMoneyBoxes)




//SHOW ROUTE FOR PRODUCTS

router.route('/:id/discharge')
    .put(isLoggedIn,isDinamicDirectAdmin, catchAsync(patients.dischargePatient))

router.route('/:id/activate')
    .get(isLoggedIn,isDinamicDirectAdmin, catchAsync(patients.activatePatient))


router.route('/:id')
    .get(isLoggedIn,catchAsync(patients.showPatient))
    .put(isLoggedIn,isDinamicDirectAdmin, validatePatient, catchAsync(patients.updatePatient))
    .delete(isLoggedIn, isDinamicDirectAdmin, catchAsync(patients.deletePatient))

router.route('/:id/pay')
    .put(isLoggedIn,catchAsync(patients.updatePayedPatient))

router.get('/:id/edit', isLoggedIn,isDirectAdminOrCaja, catchAsync(patients.renderEditForm))

//retrieve product data for patient account
router.get('/:id/search3',isLoggedIn,catchAsync(patients.search_3))

router.get('/:id/search',isLoggedIn,catchAsync(patients.searchAll))


//patient cart
router.route('/:id/accountCart')
      .post(isLoggedIn,catchAsync(patients.addToCart))
      .put(isLoggedIn,catchAsync(patients.updateServiceFromAccount))
      .delete(isLoggedIn,catchAsync(patients.deleteServiceFromAccount))

router.route('/:id/serviceTime')
      .put(isLoggedIn,catchAsync(patients.updateTimeService))

router.route('/:id/showAccount')
        .get(catchAsync(patients.patientAccount))

router.route('/:id/showDischarged')
        .get(catchAsync(patients.showDischargedPatient))

router.route('/:id/dischargedPDF')
        .get(catchAsync(patients.dischAccountPDF))

router.route('/:id/makePDF')
        .get(catchAsync(patients.accountToPDF))



module.exports = router;