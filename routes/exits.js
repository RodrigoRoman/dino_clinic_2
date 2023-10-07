const express = require('express');
const router = express.Router();
const exits = require('../controllers/exits');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isServAuthor,resetSection,resetAll,
    createBoxForm,
    createBox,
    boxForm,
    index_exits,
    showMoneyBox,
    deleteExit,
    deleteMoneyBox,
    searchAllExits,
    togglePausePoint,
    isDinamicDirectAdmin, isDirectAdminOrCaja,validateService, validateSupply, validateHospital,validateExit,validatePayment} = require('../middleware');

const multer = require('multer');


const Exit = require('../models/exit');
const Payment = require('../models/payment');


router.route('/')
    .get(isLoggedIn, isDirectAdminOrCaja,catchAsync(exits.index))
    .post(isLoggedIn, isDirectAdminOrCaja, catchAsync(exits.createPayment))

router.get('/new', isLoggedIn, isDirectAdminOrCaja, exits.renderNewForm)

router.route('/refill')
    .get(exits.refillForm)
    .put(exits.editDatePoint)

router.route('/togglePoint')
    .put(exits.togglePausePoint)

router.route('/refillSearch')
    .get(exits.searchRefillTrans)


router.route('/resetSelection')
    .put(exits.resetSection)

router.route('/resetAll')
    .put(exits.resetAllRefill)

router.route('/:id')
    .delete(isLoggedIn, isLoggedIn, isDirectAdminOrCaja, catchAsync(exits.deleteExit))

router.get('/payments', isLoggedIn,isDirectAdminOrCaja, catchAsync(exits.index_exits))

router.get('/searchAllExits', isLoggedIn,isDirectAdminOrCaja, catchAsync(exits.searchAllExits))


router.route('/hospital_account')
    .get(isLoggedIn,isDirectAdminOrCaja,exits.hospital_account)
    .post(isLoggedIn,isDirectAdminOrCaja,exits.accountReportPDF)



router.route('/box/:id')
    .get(isLoggedIn,isDirectAdminOrCaja,catchAsync(exits.showMoneyBox))

router.route('/boxShow/:id')
    .get(isLoggedIn,isDirectAdminOrCaja,catchAsync(exits.boxShowContent))

router.route('/makeCut/:id')
    .put(isLoggedIn,isDirectAdminOrCaja,catchAsync(exits.makeCut))
    
    
router.route('/box')
    .get(isLoggedIn,isDirectAdminOrCaja,catchAsync(exits.indexMoneyBox))
    .post(isLoggedIn,isDirectAdminOrCaja,catchAsync(exits.createBox))

router.route('/boxRebuild/:id')
    .get(isLoggedIn,isDirectAdminOrCaja,catchAsync(exits.boxShowFiltered))

router.route('/newBox')
    .get(isLoggedIn,isDirectAdminOrCaja,catchAsync(exits.createBoxForm))

router.get('/searchSP', isLoggedIn, isDirectAdminOrCaja, catchAsync(exits.servicesPayments))


router.route('/moneyBox/:id')
    .delete( isLoggedIn, isDirectAdminOrCaja, catchAsync(exits.deleteMoneyBox))

router.route('/generate-pdf-account')
    .post(isLoggedIn, isDirectAdminOrCaja,catchAsync(exits.generate_pdf))

router.route('/generate-pdf-stock')
    .post(isLoggedIn, isDirectAdminOrCaja,catchAsync(exits.generate_pdf_stock))
    
router.route('/removeBoxFrom/:id')
    .put(isLoggedIn, isDirectAdminOrCaja,catchAsync(exits.removeBoxFrom))

router.route('/addChangeToBox')
    .put(isLoggedIn, isDirectAdminOrCaja,catchAsync(exits.addChangeToBox))

module.exports = router;