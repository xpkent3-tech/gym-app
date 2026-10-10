import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import Anthropic from '@anthropic-ai/sdk';

import { estimateMeal, RefusedError, type EstimateInput } from './estimate';

// Credentials resolve from the environment (ANTHROPIC_API_KEY or an `ant auth login` profile). Never ship them in the app.
const client = new Anthropic();
const PORT = Number(process.env.PORT ?? 8787);
const TOKEN = process.env.FOOD_AI_TOKEN; // optional shared secret the app sends as `Authorization: Bearer …`
const MAX_BODY = 8 * 1024 * 1024;

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw Object.assign(new Error('Payload too large'), { status: 413 });
    chunks.push(chunk as Buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method !== 'POST' || req.url !== '/analyze') return send(res, 404, { error: 'Not found' });
  if (TOKEN && req.headers.authorization !== `Bearer ${TOKEN}`) return send(res, 401, { error: 'Unauthorized' });
  try {
    const body = (await readJson(req)) as EstimateInput;
    if (!body.imageBase64 && !body.text?.trim()) return send(res, 400, { error: 'Send imageBase64 and/or text' });
    send(res, 200, await estimateMeal(client, body));
  } catch (err) {
    if (err instanceof RefusedError) return send(res, 422, { error: 'declined', detail: err.message });
    if (err instanceof Anthropic.RateLimitError) return send(res, 429, { error: 'Busy, try again shortly' });
    if (err instanceof Anthropic.APIError) return send(res, 502, { error: 'Model error', status: err.status });
    if (err instanceof SyntaxError) return send(res, 400, { error: 'Invalid JSON' });
    const status = (err as { status?: number }).status ?? 500;
    send(res, status, { error: (err as Error).message });
  }
}).listen(PORT, () => console.log(`food-ai listening on :${PORT}`));
