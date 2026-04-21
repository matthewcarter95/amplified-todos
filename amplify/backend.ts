import { defineBackend } from '@aws-amplify/backend';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { echoHeaders } from './functions/echo-headers/resource';

const backend = defineBackend({
  auth,
  data,
  echoHeaders,
});

// Create HTTP API endpoint for the echo-headers function
const echoHeadersLambda = backend.echoHeaders.resources.lambda;

// Add function URL for direct HTTP access
const fnUrl = echoHeadersLambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['*'],
    allowedHeaders: ['*'],
    allowedMethods: [HttpMethod.ALL],
  },
});

// Output the function URL
backend.addOutput({
  custom: {
    echoHeadersUrl: fnUrl.url,
  },
});
