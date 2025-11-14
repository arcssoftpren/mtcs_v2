const cr = require("crypto-js");
const zlib = require("zlib");

const secret = "7538782F413F4428472B4B6250655368";

const crypter = {
  encryptObject: (obj) => {
    var ciphertext = cr.AES.encrypt(JSON.stringify(obj), secret).toString();
    return ciphertext;
  },

  decryptObject: (str) => {
    var bytes = cr.AES.decrypt(str, secret);
    var decryptedData = JSON.parse(bytes.toString(cr.enc.Utf8));
    return decryptedData;
  },

  encryptText: (str) => {
    var ciphertext = cr.AES.encrypt(str, secret).toString();
    return ciphertext;
  },

  decryptText: (str) => {
    var bytes = cr.AES.decrypt(str, secret);
    var originalText = bytes.toString(cr.enc.Utf8);
    return originalText;
  },

  compressAndEncode: (data) => {
    const compressed = zlib.gzipSync(data); // Kompresi dengan Gzip
    return compressed.toString("base64"); // Ubah ke Base64
  },

  decodeAndDecompress: (base64Data) => {
    const buffer = Buffer.from(base64Data, "base64"); // Ubah dari Base64 ke Buffer
    return zlib.gunzipSync(buffer).toString(); // Dekompresi Gzip ke teks asli
  },
};

module.exports = { crypter };
