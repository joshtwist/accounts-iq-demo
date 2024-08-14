import { ZuploContext, ZuploRequest } from "@zuplo/runtime";

export default async function policy(
  response: Response,
  request: ZuploRequest,
  context: ZuploContext,
  options: never,
  policyName: string
) {
  
  let data = await response.json();

  if (data.Envelope !== undefined) {
    data = data.Envelope
  }

  if (data.Body !== undefined) {
    data = data.Body
  }

  return new Response(JSON.stringify(data, null, 2), response);

}