import { ZuploContext, ZuploRequest } from "@zuplo/runtime";

export default async function (request: ZuploRequest, context: ZuploContext) {
  const r1 = await fetch('https://example.com');
  const r2 = await fetch('https://jsonplaceholder.typicode.com/todos');

  const d1 = await r1.text();
  const d2 = await r2.text();

  return d1 + d2;
  
}