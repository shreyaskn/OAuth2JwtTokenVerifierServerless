var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
var lambda = new AWS.Lambda();
const AuthPolicy = require('./auth-policy');

exports.handler = function(event, context, callback) {
    console.log('Client token: ' + event.authorizationToken);
    console.log('Method ARN: ' + event.methodArn);

    var params = {
        FunctionName: '', // the lambda function we are going to invoke
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: ''
    };

    params['FunctionName'] = process.env.TOKEN_VERIFIER_LAMBDA;
    params['Payload'] = '{ "token" : "' + event.authorizationToken + '" }';
    console.log(params);

    lambda.invoke(params, function(err, claims) {
        if (err) {
            console.log('Failed to validate bearer token', err);
            return context.fail('Unauthorized');
        } else {
            buildPolicy(claims, event, callback);
        }
    });
};


function buildPolicy(claims, event, callback) {

    var payload = JSON.parse(claims.Payload);
    if (! payload) {
        return context.fail('Unauthorized');
    }
    console.log('Payload: ' + claims.Payload);
    var sub = payload.sub;
    var scope = payload.scope;

    var apiOptions = {};
    const arnParts = event.methodArn.split(':');
    const apiGatewayArnPart = arnParts[5].split('/');
    const awsAccountId = arnParts[4];
    apiOptions.region = arnParts[3];
    apiOptions.restApiId = apiGatewayArnPart[0];
    apiOptions.stage = apiGatewayArnPart[1];
    const method = apiGatewayArnPart[2];
    var resource = '/'; // root resource

    if (apiGatewayArnPart[3]) {
        resource += apiGatewayArnPart[3];
    }

    const policy = new AuthPolicy(sub, awsAccountId, apiOptions);

    if (scope == process.env.SCOPE) {
        policy.allowMethod(AuthPolicy.HttpVerb.GET, "*");
        policy.allowMethod(AuthPolicy.HttpVerb.POST, "*");
        policy.allowMethod(AuthPolicy.HttpVerb.PUT, "*");
        policy.allowMethod(AuthPolicy.HttpVerb.PATCH, "*");
        policy.allowMethod(AuthPolicy.HttpVerb.DELETE, "*");
        policy.allowMethod(AuthPolicy.HttpVerb.HEAD, "*");
        policy.allowMethod(AuthPolicy.HttpVerb.OPTIONS, "*");
    }
    else {
        return context.fail('Unauthorized');
    }

    callback(null, policy.build());
}