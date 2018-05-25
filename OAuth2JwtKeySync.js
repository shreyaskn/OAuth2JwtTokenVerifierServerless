const https = require('https');
const async = require('async');
var AWS = require("aws-sdk");

var params = {
    TableName: "",
    Item: ""
}
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context) {

    https.get(process.env.DISCOVERY_URL, (res) => {
        console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        res.on('data', function(data) {
            fetchKeys(JSON.parse(data).jwks_uri);
        });
    }).on('error', (e) => {
        console.error(e);
    });

};

function fetchKeys(jwks_uri) {
    https.get(jwks_uri, (res) => {
        console.log('statusCode:', res.statusCode);
        res.on('data', function(data) {
            var jsonData = JSON.parse(data);
            async.forEach(jsonData.keys, function(item, callback) {
                storeKeysInDB(item);
                callback();
            }, function(err) {
                console.log('iterating done');
            });
        });
    }).on('error', (e) => {
        console.error(e);
    });
}

function storeKeysInDB(item) {
    params.TableName = process.env.IAM_KEYS_TABLE;
    var entry = {};
    entry.kid = item.kid;
    entry.x5c = item.x5c;
    console.log(entry);
    params.Item = entry;
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });
}
