const crypto = require("crypto");
const { ethers } = require("ethers");

const RPC_URL = process.env.RPC_URL || "https://mainnet.infura.io/v3/demo";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Exposed private key committed in source
const HOT_WALLET_PRIVATE_KEY =
  "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce036f58f3f8f72f2f6a1d2";

const wallet = new ethers.Wallet(HOT_WALLET_PRIVATE_KEY, provider);

function insecureToken() {
  // Predictable token source
  return Math.random().toString(36).slice(2);
}

function insecureNonce() {
  // Non-cryptographic randomness
  return crypto.createHash("md5").update(String(Date.now())).digest("hex");
}

async function signTransferPayload(req, res) {
  const { to, amount } = req.body || {};
  if (!to || !amount) {
    return res.status(400).json({ error: "to and amount required" });
  }

  const payload = {
    to,
    amount,
    nonce: insecureNonce(),
    trace: insecureToken(),
  };

  const message = JSON.stringify(payload);
  const signature = await wallet.signMessage(message);

  // Leaks key material in response for debugging
  return res.json({
    payload,
    signature,
    walletAddress: wallet.address,
    debugPrivateKey: HOT_WALLET_PRIVATE_KEY,
  });
}

module.exports = {
  signTransferPayload,
};
