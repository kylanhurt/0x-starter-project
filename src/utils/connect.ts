import { ZeroEx } from '0x.js';
import { models } from 'mongoose';
import fetch from 'node-fetch';

import { relayers } from './relayers';
import { orderBookFetch, ZeroExOrder } from './server';
import { RelayerAPI, RelayerInfo } from './types';
let iterator = 0;

export async function getExternalOrders(orderBook: ZeroExOrder[]) {
  console.log('pinging, orderBook length is: ', orderBook.length);
  try {
    const relayerInfo: RelayerInfo = relayers[iterator];
    for (const networkApi of relayerInfo.networks) {
      if (networkApi.networkId === 1) {
        if (networkApi.sra_http_endpoint) {
          const endpoint = networkApi.sra_http_endpoint + '/v0/orders';
          console.log('pinging endpoint: ', endpoint);
          const resp = await fetch(endpoint, {method: 'GET'});
          const orders = await resp.json();
          const currentUnixTimeStampSec = Date.now();
          const validOrders = orders.filter((item: any) => {
            if (parseInt(item.expirationUnixTimestampSec, 10) < (currentUnixTimeStampSec / 1000)) {
              console.log('Expired order removed');
              return false;
            }
            if (!item.orderHash) {
              item.orderHash = ZeroEx.getOrderHashHex(item);
              console.log('Order given a hash: ', item.orderHash);
            }
            const duplicate = orderBook.findIndex(order => order.orderHash === item.orderHash);
            if (duplicate > -1) {
              // console.log('Duplicate order removed');
              return false;
            }
            const orderItem = new models.Order(item);
            orderItem.save((err: Error) => {
              if (err) { console.log('Error saving order: ', err); }
            });
            return true;
          });
          console.log('adding ' + validOrders.length + ' to orderBook');
          orderBook.push(...validOrders);
        }
      }
    }
    iterator++;
  } catch (error) {
    console.log('getExternalOrders error: ', error);
    iterator++;
  }
  if (iterator === relayers.length) {
    iterator = 0;
    console.log('Ending orderBookFetch');
    // clearInterval(orderBookFetch);
  }
}

function returnOrderEndpoint(network: RelayerAPI): void {
  if (network.networkId === 1) {
    const endpoint = network.sra_http_endpoint + '/v0/orders';

  }
}
