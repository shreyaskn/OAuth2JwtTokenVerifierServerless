var jwt = require('jsonwebtoken');
var AWS = require('aws-sdk');
const async = require('async');

var docClient = new AWS.DynamoDB.DocumentClient();
var params = {
    TableName: "",
    Key: {
        kid: ""
    }
};

exports.handler = function(event, context) {
    var decoded = jwt.decode(event.token, {
        complete: true
    });
    params["TableName"] = process.env.IAM_KEYS_TABLE;
    params["Key"]["kid"] = decoded.header.kid;
    console.log(params);

    /*
   		Get the key for verification of signature from Dynamodb
	*/
	docClient.get(params, function(err, data) {
		if (err) {
			console.log("DBError", err);
			context.fail(err);
		} else {
			console.log("DB Success", data.Item);
			/*
			For a given kid there can be more than one public keys in the corner
			case of key rotation hence looping over all the keys 
			*/
			async.forEach(data.Item.x5c, function(item, index) {
				try {
					context.succeed(jwt.verify(event.token, createPublicCert(certStr)));
					return true;
				} catch (err) {
					console.log("Verify with Key failed for index", index);
				}
			}, allKeysTried(context));
		}
	});
};


/*
   Converts the key which is in String format to X509 Cert format
*/
function createPublicCert(certStr) {
    var cert = "-----BEGIN CERTIFICATE-----\n";
    var splitCnt = certStr.length / 64;
    var splitChr = 63;
    var offset = 0
    for (var i = 0; i < splitCnt; i++) {
        cert = cert + certStr.substring(offset, splitChr);
        cert = cert + "\n";
        offset += 63;
        splitChr += 63;
    }
    cert = cert + "-----END CERTIFICATE-----\n"
    return cert;
}

// for each "done" callback.
function allKeysTried(context) {
	console.log("Tried all available keys");
	var error = new Error("Tried all available keys nothing ");
	context.fail(err);
}
