const coap = require('coap');
const bl = require ("bl");
const crypto = require ("crypto");

// Crypto
const algorithm = "aes-256-cbc"; 
const aesIv = Buffer.from("1234567890123456")
const key = Buffer.from("12345678901234567890123456789012")

function decrypt(encryptedData) {
  const decipher = crypto.createDecipheriv(algorithm, key, aesIv);

  let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
  decryptedData += decipher.final("utf-8");
  return decryptedData;
}

// HMAC
const secret = 'ismasero248502349851';
function getHmac(data) {
  const hmac = crypto.createHmac('sha256', secret);
  return hmac.update(data).digest('hex');
}

// CoAP client
const req = coap.request('coap://localhost/Marius')
req.on('response' , function(res){
  console.log()
  console.log('Response code', res.code);
  if (res.code !== '2.05') return process.exit(1);
  
  res.pipe(bl(function(err, data) {  
    // decrypt
    let decPayload = "{}"; 
    try {
      decPayload = decrypt(data.toString());
    }catch{ } 

    // parse
    const obj = JSON.parse(decPayload);
    if(!obj.message || !obj.hmac){
      console.log('I have received an invalid message from the server :(');
      return;
    }
    let text = decrypt(obj.message);
    let hmac = getHmac(text);

    // check
    console.log('The fetch from the server completed successfully');
    console.log(`-> Received payload:`, data.toString()); 
    console.log(`-> Received data:`, text.toString());
    if(hmac !== obj.hmac){
      console.log('-> WARNING: The data was altered :(');
    } else {
      console.log('-> The data is OK :D');
    }
  }))
  res.on('end', () => {
    process.exit(0)
  })
})
req.end();

// CoAP client
/*
var req2 = coap.request({

  observe: false,
  host: '192.168.0.93',
  pathname: '/',
  port: 5683,
  method: 'get',
  confirmable: 'true',
  retrySend: 'true',
  //query:'',
  options: {
    //  "Content-Format": 'application/json'
  }

})

//put payload into request      
var payload = {
  username: 'aniu',
}
req2.write(JSON.stringify(payload));

//waiting for coap server send con response
req2.on('response', function(res) {
  //print response code, headers,options,method
  console.log('response code', res.code);

  if (res.code !== '2.05') return process.exit(1);
  //get response/payload from coap server, server sends json format
  res.pipe(bl(function(err, data) {
    //parse data into string
    var json = JSON.parse(data);
    console.log("string:", json);
    // JSON.stringify(json));
  }))

});
req2.end();*/