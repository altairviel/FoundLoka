const midtransClient = require('midtrans-client');

//snap, ini untuk payment popup di frontend
const snap = new midtransClient.Snap({
  isProduction: false, //pakek sandbox mode
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

//CoreApi, ini untuk cek status transaksi
const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

module.exports = { snap, coreApi };
