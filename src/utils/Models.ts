import * as mongoose from 'mongoose';

const orderSchema: mongoose.Schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
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

export const Order = mongoose.model('Order', orderSchema, 'orders');

export const models = {
  Order,
};
