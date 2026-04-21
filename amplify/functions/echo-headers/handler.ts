import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const headers = event.headers || {};

  // Extract commonly useful headers, especially those from proxies
  const responseData = {
    allHeaders: headers,
    highlighted: {
      "x-forwarded-for": headers["x-forwarded-for"] || null,
      "x-auth-user": headers["x-auth-user"] || null,
      "x-real-ip": headers["x-real-ip"] || null,
      "user-agent": headers["user-agent"] || null,
      "host": headers["host"] || null,
      "origin": headers["origin"] || null,
      "referer": headers["referer"] || null,
    },
    requestContext: {
      sourceIp: event.requestContext?.http?.sourceIp || null,
      method: event.requestContext?.http?.method || null,
      path: event.requestContext?.http?.path || null,
    },
  };

  // CORS headers are handled by the Lambda function URL configuration
  // Do not set them here to avoid duplicate header values
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(responseData, null, 2),
  };
};
