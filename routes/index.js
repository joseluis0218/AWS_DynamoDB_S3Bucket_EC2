var express = require('express');
var router = express.Router();
var controller = require('../controllers/agendaController');
/* GET home page. */
router.get('/', function(req, res, next) {
  controller.show(req,res);
});
router.get('/registrar', function(req, res, next) {
    res.render('registrar');
});
router.post('/registrar', function(req,res,next){
    controller.create(req,res);
});

router.get('/editar/:id', function(req, res, next) {
    controller.detail(req,res);
});
router.post('/actualizar', function(req,res,next){
    controller.update(req,res);
});
router.post('/eliminar/:id/:foto', function(req,res,next){
    controller.delete(req,res);
});
module.exports = router;
