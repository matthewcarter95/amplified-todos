import { defineFunction } from "@aws-amplify/backend";

export const echoHeaders = defineFunction({
  name: "echo-headers",
});
