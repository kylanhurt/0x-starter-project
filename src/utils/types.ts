import { schemas as zeroExSchemas } from '@0xproject/json-schemas';

const { orderSchema } = zeroExSchemas;

export interface RelayerInfo {
  name: string;
  homepage_url?: string;
  app_url?: string;
  logo_img?: string;
  networks: RelayerAPI[];
}

export interface RelayerAPI {
  networkId: number;
  sra_http_endpoint?: string;
  sra_ws_endpoint?: string;
  static_order_fields?: any;
}
