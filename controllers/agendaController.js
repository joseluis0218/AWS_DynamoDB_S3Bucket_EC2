const AWS = require('aws-sdk');
var uuid = require('uuid');


const BUCKET_NAME = 'joseluis0218.tecsup.edu.pe';
const IAM_USER_KEY = 'AKIAI2BHSXZ52HQEIXZA';
const IAM_USER_SECRET = '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';
AWS.config.update({
    region: "us-east-2",
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
});
var docClient = new AWS.DynamoDB.DocumentClient();
var s3bucket = new AWS.S3();
var table = "agenda";

module.exports = {
    show: function (req, res) {
        var dynamoParams = {
            TableName: table,
            ProjectionExpression: "id, nombre, apellidos, correo, fecha_nac, foto"
        };
        docClient.scan(dynamoParams, function (err, data) {
            if (err) {
                console.error(err);
            } else {
                res.render('index', { datos: data.Items });
            }
        });
    },
    create: function (req, res) {
        var file = req.files.foto;
        s3bucket.createBucket(function () {
            var bucketParams = {
                Bucket: BUCKET_NAME,
                Key: file.name,
                Body: file.data
            };
            s3bucket.upload(bucketParams, function (err, data) {
                if (err) {
                    console.log('error in callback');
                    console.log(err);
                } else {
                    console.log('success');
                }
                if (data) {
                    var entrada = {
                        "id": uuid.v1({ node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab] }).toString(),
                        "nombre": req.body.nombre,
                        "apellidos": req.body.apellidos,
                        "correo": req.body.correo,
                        "fecha_nac": req.body.fecha_nac,
                        "foto": file.name
                    }
                    var dynamoParams = {
                        TableName: table,
                        Item: entrada
                    };
                    docClient.put(dynamoParams, function (err, data) {
                        if (err) {
                            console.error(err);
                            res.send(500);
                        } else {
                            console.log(data);
                            res.redirect('/');
                        }
                    });
                }

            });
        });
    },
    detail : function(req,res){
        var val_id = req.params.id;

        var dynamoParams = {
            TableName: table,
            Key: { "id": val_id }
        };

        docClient.get(dynamoParams, function(err, data) {
            if (err) {
                console.error(err);
                res.send(500);
            } else {
                res.render('editar', { datos: data.Item});
            }
        });
    },
    update: function (req, res) {
        var val_id = req.body.id;
        var file = req.files.foto;
        var paramsOne = {
            TableName: table,
            Key: { "id": val_id }
        };
        docClient.get(paramsOne, function (err, item) {
            console.log(item)
            if (err) {
                console.error(err);
                res.send(500);
            } else {
                let usuario = item.Item;
                var bucketParams = {
                    Bucket: BUCKET_NAME,
                    Key: usuario.foto
                };

                s3bucket.deleteObject(bucketParams, function (err, data) {
                    if (err) {
                        console.log(err, err.stack);
                    } else {
                        var bucketParams1 = {
                            Bucket: BUCKET_NAME,
                            Key: file.name,
                            Body: file.data
                        };
                        s3bucket.upload(bucketParams1, function (err, data) {
                            if (err) {
                                console.log("Error", err);
                                res.redirect('/');
                            }
                            if (data) {
                                var updateParams = {
                                    TableName: table,
                                    Key: {
                                        "id": val_id
                                    },
                                    UpdateExpression: "set nombre = :nombre, fecha_nac = :fecha_nac , apellidos = :apellidos , foto = :foto, correo = :correo",
                                    ExpressionAttributeValues: {
                                        ":nombre": req.body.nombre,
                                        ":apellidos": req.body.apellidos,
                                        ":correo": req.body.correo,
                                        ":fecha_nac": req.body.fecha_nac,
                                        ":foto": file.name,
                                    },
                                    ReturnValues: "UPDATED_NEW"
                                };
                                docClient.update(updateParams, function (err, data) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log("Registro Actualizado correctamente");
                                        res.redirect('/');
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    },
    delete: function (req, res) {
        console.log(req.params);
        var val_id = req.params.id;
        var file = req.params.foto;

        var dynamoParams = {
            TableName: table,
            Key: { "id": val_id }
        };
        docClient.get(dynamoParams, function(err, item) {
            let usuario = item.Item;
            if (err) {
                console.error(err);
                res.send(500);
            } else {
                var bucketParams = {
                    Bucket: BUCKET_NAME,
                    Key: usuario.foto
                };
                s3bucket.deleteObject(bucketParams, function(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                    } else {
                        var entrada = {
                            "id": val_id,
                        }
                        var params = {
                            TableName: table,
                            Key: entrada
                        };

                        docClient.delete(params, function(err, data) {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log(data);
                                console.log("Eliminado correctamente");
                                res.redirect('/');
                            }
                        });

                    }
                });
            }
        });
    }
};  