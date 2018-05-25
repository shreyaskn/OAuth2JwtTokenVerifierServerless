# OAuth2JwtTokenVerifierServerless
This repo is for general purpose Lambdas which will provide 2 legged authentication for Oauth Authentication using JWT

## Signing Key Extractor Lambda:
1)	Call the Discovery URL: https://identity.mcafee.com/core/.well-known/openid-configuration   (for time being lets hard code, in future use S3 ? )
2)	fetch ‘jwks_uri’ from response of 1) for example: “jwks_uri": "https://identity.mcafee.com/core/.well-known/jwks",
3)	Call the value for above example: ‘https://identity.mcafee.com/core/.well-known/jwks’
4)	Store all the Keys in dynamoDb / Cache.

Call Lambda 1 periodically once in 30 min ( configurable ), can also be called on Demand.


## Token Validator Lambda:
                
1)	Input is a ids token
2)	Validate the JWS token using the keys fetched from DynamoDb / Cache (got from L1)

## Use Cases

These lambda can be used by any serverless projects / micro services for Authentication when using OAuth standard based authenticator.

## Integration Example

 Call the lambda with input payload as
 ```
 {
       token: " .......... ",
       scopes: <comma separated list>
 }
 ```
 
 example NodeJS integration:
 
 ```
 var lambda = new AWS.Lambda();
 
 var params = {
    FunctionName: 'OAuth2JwtTokenVerifierServerless-<Stage>-OAuth2JwtTokenVerifier', // Verifier Lambda, can be taken from ENV variable
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: '{ "token" : "...", "scopes":...}'
  };


 lambda.invoke(params, function(err, claims) {
    if (err) {
      console.log('Failed to validate bearer token', err);
      return context.fail('Unauthorized');
    } else {
        console.log('Payload: ' + claims.Payload);
        ......
    }
  }
 ```
 

# Developer Setup

## Dev Machine Prerequisites :

Operating System: CentOS 7
### Stop Firewall: 
```bash
>> systemctl stop firewalld
```
### Disable Firewall:
```bash
>> systemctl disable firewalld
```

### Install NodeJS

Follow the below link
https://www.e2enetworks.com/help/knowledge-base/how-to-install-node-js-and-npm-on-centos/ 


## Setup Serverless

You need to setup serverless on you *nix* machine for deployment
Follow guidelines given in https://serverless.com/framework/docs/providers/aws/guide/installation/  

### Set up AWS on Serverless

Create an API user on AWS and have the key and secret handy

```bash
serverless config credentials --provider aws --key <> --secret <>
```
## get the node_modules for serverless package using the package.json
```bash
npm install
```

## Deploy

After having built the deployment artifact using Gradle or Maven as described above you can deploy by simply running

```bash
serverless deploy --stage dev  --region <>
```

The expected result should be similar to:
```bash
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading function .zip files to S3...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
CloudFormation - UPDATE_IN_PROGRESS - AWS::CloudFormation::Stack - OAuth2JwtTokenVerifierServerless-dev
CloudFormation - CREATE_IN_PROGRESS - AWS::Logs::LogGroup - OAuth2JwtKeySyncLogGroup
CloudFormation - UPDATE_IN_PROGRESS - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::Logs::LogGroup - OAuth2JwtKeySyncLogGroup
CloudFormation - CREATE_COMPLETE - AWS::Logs::LogGroup - OAuth2JwtKeySyncLogGroup
CloudFormation - UPDATE_COMPLETE - AWS::IAM::Role - IamRoleLambdaExecution
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Function - OAuth2JwtKeySyncLambdaFunction
CloudFormation - UPDATE_IN_PROGRESS - AWS::Lambda::Function - OAuth2JwtTokenVerifierLambdaFunction
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Function - OAuth2JwtKeySyncLambdaFunction
CloudFormation - UPDATE_COMPLETE - AWS::Lambda::Function - OAuth2JwtTokenVerifierLambdaFunction
CloudFormation - CREATE_COMPLETE - AWS::Lambda::Function - OAuth2JwtKeySyncLambdaFunction
CloudFormation - CREATE_IN_PROGRESS - AWS::Events::Rule - OAuth2JwtKeySyncEventsRuleSchedule1
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Version - OAuth2JwtTokenVerifierLambdaVersionnNDstv6JeQVWv5bZfEQTvVZn7hh4DS84hLfR1k1NIs
CloudFormation - CREATE_IN_PROGRESS - AWS::Events::Rule - OAuth2JwtKeySyncEventsRuleSchedule1
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Version - OAuth2JwtKeySyncLambdaVersionnNDstv6JeQVWv5bZfEQTvVZn7hh4DS84hLfR1k1NIs
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Version - OAuth2JwtTokenVerifierLambdaVersionnNDstv6JeQVWv5bZfEQTvVZn7hh4DS84hLfR1k1NIs
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Version - OAuth2JwtKeySyncLambdaVersionnNDstv6JeQVWv5bZfEQTvVZn7hh4DS84hLfR1k1NIs
CloudFormation - CREATE_COMPLETE - AWS::Lambda::Version - OAuth2JwtTokenVerifierLambdaVersionnNDstv6JeQVWv5bZfEQTvVZn7hh4DS84hLfR1k1NIs
CloudFormation - CREATE_COMPLETE - AWS::Lambda::Version - OAuth2JwtKeySyncLambdaVersionnNDstv6JeQVWv5bZfEQTvVZn7hh4DS84hLfR1k1NIs
CloudFormation - CREATE_COMPLETE - AWS::Events::Rule - OAuth2JwtKeySyncEventsRuleSchedule1
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Permission - OAuth2JwtKeySyncLambdaPermissionEventsRuleSchedule1
CloudFormation - CREATE_IN_PROGRESS - AWS::Lambda::Permission - OAuth2JwtKeySyncLambdaPermissionEventsRuleSchedule1
CloudFormation - CREATE_COMPLETE - AWS::Lambda::Permission - OAuth2JwtKeySyncLambdaPermissionEventsRuleSchedule1
CloudFormation - UPDATE_COMPLETE_CLEANUP_IN_PROGRESS - AWS::CloudFormation::Stack - OAuth2JwtTokenVerifierServerless-dev
CloudFormation - DELETE_SKIPPED - AWS::Lambda::Version - OAuth2JwtTokenVerifierLambdaVersionFmtIVCtcF9AScGhoCrpRrY3RH5BciVDTU9DB541ZaE
CloudFormation - UPDATE_COMPLETE - AWS::CloudFormation::Stack - OAuth2JwtTokenVerifierServerless-dev
Serverless: Stack update finished...
Service Information
service: OAuth2JwtTokenVerifierServerless
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  OAuth2JwtTokenVerifier: OAuth2JwtTokenVerifierServerless-dev-OAuth2JwtTokenVerifier
  OAuth2JwtKeySync: OAuth2JwtTokenVerifierServerless-dev-OAuth2JwtKeySync

Stack Outputs
OAuth2JwtKeySyncLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:811797731536:function:OAuth2JwtTokenVerifierServerless-dev-OAuth2JwtKeySync:1
OAuth2JwtTokenVerifierLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:811797731536:function:OAuth2JwtTokenVerifierServerless-dev-OAuth2JwtTokenVerifier:2
ServerlessDeploymentBucketName: oauth2jwttokenverifierse-serverlessdeploymentbuck-g3nf2wcac4zz
```

### Technical Pipeline

## TODO
- Certificate Validation (HTTPS verification) for Synching of keys.
- Use Elastic Cache along with Dynamo for storing config.
- Strategy for Rotation of Signing Keys.
