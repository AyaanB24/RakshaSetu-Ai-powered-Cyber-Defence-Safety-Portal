const crypto = require('crypto');
const fs = require('fs');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

console.log('--- PUBLIC KEY START ---');
console.log(publicKey);
console.log('--- PUBLIC KEY END ---');

console.log('--- PRIVATE KEY START ---');
console.log(privateKey);
console.log('--- PRIVATE KEY END ---');
