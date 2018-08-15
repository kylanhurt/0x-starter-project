import fetch from 'node-fetch';

import { relayers } from './relayers';
import { RelayerAPI, RelayerInfo } from './types';
let iterator = 0;

export async function getExternalOrders() {
  try {

    console.log('pinging');
    const relayerInfo: RelayerInfo = relayers[iterator];
    for (const networkApi of relayerInfo.networks) {
      if (networkApi.networkId === 1) {
        if (networkApi.sra_http_endpoint) {
          const endpoint = networkApi.sra_http_endpoint + '/v0/orders';
          const resp = await fetch(endpoint, {method: 'GET'});
          const orders = await resp.json();
          console.log('Response from ', endpoint, ' is: ', orders);
        }
      }
    }
    iterator++;
  } catch (error) {
    console.log('getExternalOrders error', error);
    iterator++;
  }
}

function returnOrderEndpoint(network: RelayerAPI): void {
  if (network.networkId === 1) {
    const endpoint = network.sra_http_endpoint + '/v0/orders';

  }
}
