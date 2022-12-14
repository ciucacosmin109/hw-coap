const coap = require('coap')
const crypto = require ("crypto");

// Crypto
const algorithm = "aes-256-cbc"; 
const aesIv = Buffer.from("1234567890123456")
const key = Buffer.from("12345678901234567890123456789012")

function encrypt(data) {
  const cipher = crypto.createCipheriv(algorithm, key, aesIv);

  let encryptedData = cipher.update(data, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData
}

// HMAC
const secret = 'ismasero248502349851';
function getHmac(data) {
  const hmac = crypto.createHmac('sha256', secret);
  return hmac.update(data).digest('hex');
}

// Payload
function getPayload(msg) {
  let cipherText = encrypt(msg);
  let hmac = getHmac(msg);

  return {
    message: cipherText,
    hmac: hmac
  }
}

// Coap server
const server = coap.createServer()
server.on('request', (req, res) => {
  console.log()

  if(req.url.split('/')[1] !== "Marius") {
    console.log("Invalid route")
    res.end('Invalid url ;)')
  }
  
  console.log('New request. The server will send:') 
  const message = `Your token is: ${Math.random() * 10000}`; 
  console.log('Message:', message) 
  const payload = getPayload(message);
  console.log("Payload:", payload)
  const encPayload = encrypt(JSON.stringify(payload));
  console.log("Encrypted payload:", encPayload)
  
  res.end(encPayload);
})

// The default CoAP port is 5683
server.listen(() => {
  console.log("Started on UDP 5683");
})