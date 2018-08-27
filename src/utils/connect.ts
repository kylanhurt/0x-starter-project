import fetch from 'node-fetch';

import { relayers } from './relayers';
import { ZeroExOrder } from './server';
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
              console.log('Invalid order removed');
              return false;
            }
            return true;
          });
          orderBook.push(...validOrders);
          // console.log('orderBook: ', orderBook);
        }
      }
    }
    iterator++;
  } catch (error) {
    console.log('getExternalOrders error');
    iterator++;
  }
  if (iterator === relayers.length) {
    iterator = 0;
  }
}

function returnOrderEndpoint(network: RelayerAPI): void {
  if (network.networkId === 1) {
    const endpoint = network.sra_http_endpoint + '/v0/orders';

  }
}
