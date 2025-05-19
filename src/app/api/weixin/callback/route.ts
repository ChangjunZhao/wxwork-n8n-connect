import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a mock endpoint. In a real scenario, you would:
// 1. Verify the signature from Weixin Work (using crypto, token, timestamp, nonce, echostr/msg_encrypt).
// 2. Decrypt the message if it's encrypted (using EncodingAESKey).
// 3. Parse the XML payload.
// 4. Process the event (e.g., trigger an n8n workflow).
// 5. Respond with "success" or an empty string for message events, or the echostr for verification.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const msg_signature = searchParams.get('msg_signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');
  const echostr = searchParams.get('echostr');

  // TODO: Implement actual signature verification
  // For now, if echostr is present, assume it's a verification request and return it.
  if (echostr && msg_signature && timestamp && nonce) {
    console.log('Received Weixin API verification request:', { msg_signature, timestamp, nonce, echostr });
    // In a real app: verify_signature(token, timestamp, nonce, echostr/msg_encrypt)
    // If verification is successful, return echostr
    return new NextResponse(echostr, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  return NextResponse.json({ message: 'Ready to receive Weixin events. Send POST for messages or GET with verification params.' }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const msg_signature = searchParams.get('msg_signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');

  try {
    const rawBody = await request.text(); // Weixin sends XML
    console.log('Received Weixin POST request headers:', Object.fromEntries(request.headers));
    console.log('Received Weixin POST request query params:', { msg_signature, timestamp, nonce });
    console.log('Received Weixin POST request body (raw):', rawBody);

    // TODO: Implement actual signature verification and message decryption/parsing
    // For example:
    // if (!verify_signature(token, timestamp, nonce, encrypted_message_from_body)) {
    //   return new NextResponse('Signature verification failed', { status: 401 });
    // }
    // const decrypted_xml = decrypt_message(encodingAESKey, encrypted_message_from_body);
    // const parsed_event = parse_xml(decrypted_xml);
    // process_event(parsed_event);

    // For this mock, we just acknowledge receipt.
    // Weixin expects "success" string or an empty body with 200 OK for async messages.
    // For synchronous messages (reply needed within 5s), you'd return an XML response.
    return new NextResponse('success', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (error) {
    console.error('Error processing Weixin callback:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
