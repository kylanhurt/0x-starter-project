import * as mongoose from 'mongoose';

export const orderSchema: mongoose.Schema = new mongoose.Schema({
  maker: String,
  taker: String,
  makerFee: String,
  takerFee: String,
  makerTokenAmount: String,
  takerTokenAmount: String,
  makerTokenAddress: String,
  takerTokenAddress: String,
  salt: String,
  feeRecipient: String,
  expirationUnixTimestampSec: String,
  exchangeContractAddress: String,
});

export const Order = mongoose.model('order', orderSchema);

export const models = {
  orderSchema,
};
