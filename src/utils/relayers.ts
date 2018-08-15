export const relayers = [
    {
        'name': 'Radar Relay',
        'homepage_url': 'https://radarrelay.com',
        'app_url': 'https://app.radarrelay.com',
        'header_img' : 'radarrelay.png',
        'logo_img': 'radarrelay.png',
        'networks': [
            {
                'networkId': 1,
                'sra_http_endpoint': 'https://api.radarrelay.com/0x',
                'sra_ws_endpoint': 'wss://ws.radarrelay.com/0x',
                'static_order_fields': {
                    'fee_recipient_addresses': ['0xa258b39954cef5cb142fd567a46cddb31a670124'],
                },
            },
            {
                'networkId': 42,
                'sra_http_endpoint': 'https://api.kovan.radarrelay.com/0x',
                'sra_ws_endpoint': 'wss://api.kovan.radarrelay.com/0x',
            },
        ],
    },
    {
        'name': 'ERC dEX',
        'homepage_url': 'https://ercdex.com',
        'app_url': 'https://app.ercdex.com/',
        'header_img' : 'ercdex.png',
        'logo_img': 'ercdex.png',
        'networks': [
            {
                'networkId': 1,
                'sra_http_endpoint': 'https://api.ercdex.com/api/standard/1',
                'static_order_fields': {
                    'fee_recipient_addresses': ['0x58a5959a6c528c5d5e03f7b9e5102350e24005f1', '0x7df569a165bee41ca74374c76bd888ea02dcc4a8', '0xa71deef328b2c40d0e6525cd248ae749e9208dbb', '0x3d974ce554fec1acd8d034f13b6640b300689a37', '0xbd069e7ad0b7366ed1f0559dd8fe3e8efc0c4a72', '0x4411c446756f8ed22343e8fbe8d24607027daffd', '0xee2d43b8e4b57477acc2f4def265fe2887865ac0', '0x5bf2c11b0aa0c752c6de6fed48dd56fed2a4286d', '0x1dd43bbe2264234bccfbb88aadbde331d87719ee', '0x8bf0785306eb675e38b742f59a7fcf05fccdf2b7', '0x1956f5afa5d21000145e6cd2fa8ce3f52fa40875', '0xa5b8d094f8364a9771c7a2287ee13efa08f847a4', '0xc95bf3d3b4d6619119f3a8e29ec1d73ee801b9df', '0x28f5cf7044f509af67f473c18b1f5f4f97fb4ce9', '0x3b4ce2ea700ff327c3b4fe624f328c4106fd2885', '0x3fa5f23d42847e49d242496ffe2a3c8fda66706c', '0xd592cfa56f4c443fb27008329d67ed7d4edb59c0', '0x173a2467cece1f752eb8416e337d0f0b58cad795'],
                },
            },
            {
                'networkId': 42,
                'sra_http_endpoint': 'https://api.ercdex.com/api/standard/42/v0/',
            },
        ],
    },
    {
        'name': 'OpenRelay',
        'homepage_url': 'https://openrelay.xyz/',
        'logo_img': 'openrelay.png',
        'header_img' : 'openrelay.png',
        'networks': [
            {
                'networkId': 1,
                'sra_http_endpoint': 'https://api.openrelay.xyz',
                'static_order_fields': {
                    'fee_recipient_addresses': ['0xc22d5b2951db72b44cfb8089bb8cd374a3c354ea'],
                },
            },
            {
                'networkId': 3,
                'sra_http_endpoint': 'https://api.openrelay.xyz',
                'static_order_fields': {
                    'fee_recipient_addresses': ['0xc22d5b2951db72b44cfb8089bb8cd374a3c354ea'],
                },
            },
        ],
    },
    {
        'name': 'The Ocean',
        'homepage_url': 'https://theocean.trade/',
        'logo_img': 'TheOceanX.png',
        'header_img' : 'theoceanx.png',
        'networks': [
            {
                'networkId': 42,
            },
            {
              'networkId': 1,
              'static_order_fields' : {
                'fee_recipient_addresses' : ['0x7219612be7036d1bfa933e16ca1246008f38c5fe'],
              },
            },
        ],
    },
    {
        'name': 'Amadeus Relay',
        'homepage_url': 'https://amadeusrelay.org/',
        'logo_img': 'amadeus_relay.png',
        'header_img' : 'amaedeus.png',
        'networks': [
            {
                'networkId': 42,
                'sra_http_endpoint': 'https://kovan.amadeusrelay.org/api/v0/',
                'static_order_fields': {
                    'fee_recipient_addresses': ['0xf14958eca9f5b341f74916aacfb6e3d2fb9a4a15'],
                },
            },
            {
                'networkId': 1,
                'sra_http_endpoint': 'https://api.amadeusrelay.org/api/v0/',
                'static_order_fields': {
                    'fee_recipient_addresses': ['0x0e8ba001a821f3ce0734763d008c9d7c957f5852'],
                },
            },
        ],
    },
    {
        'name': 'Token Jar',
        'homepage_url': 'https://tokenjar.io/',
        'header_img' : 'tokenjar.png',
        'logo_img': 'tokenjar.png',
        'networks': [
            {
                'networkId': 1,
                'static_order_fields': {
                    'fee_recipient_addresses' : ['0x5e150a33ffa97a8d22f59c77ae5487b089ef62e9'],
                },
            },
        ],
    },
    {
        'name': 'Paradex',
        'homepage_url': 'https://paradex.io/',
        'app_url': 'https://app.paradex.io/',
        'header_img' : 'paradex.png',
        'logo_img': 'paradex.png',
        'networks': [
            {
                'networkId': 1,
                'static_order_fields': {
                    'taker_addresses': ['0xd2045edc40199019e221d71c0913343f7908d0d5', '0x4969358e80cdc3d74477d7447bffa3b2e2acbe92'],
                },
            },
        ],
    },
    {
        'name': 'IDT Exchange',
        'homepage_url': 'https://www.idtexchange.com/',
        'app_url': 'https://trade.idtexchange.com/',
        'header_img' : 'idtexchange.png',
        'logo_img': 'idtexchange.png',
        'networks': [
            {
                'networkId': 1,
                'static_order_fields' : {
                    'fee_recipient_addresses': ['0xeb71bad396acaa128aeadbc7dbd59ca32263de01'],
                },
            },
        ],
    },
    {
        'name': 'DDEX',
        'homepage_url': 'https://ddex.io/',
        'app_url': 'https://ddex.io/trade',
        'header_img' : 'ddex.png',
        'logo_img': 'ddex.png',
        'networks': [
            {
                'networkId': 1,
                'static_order_fields': {
                    'fee_recipient_addresses': ['0xe269e891a2ec8585a378882ffa531141205e92e9'],
                    'taker_addresses': ['0xe269e891a2ec8585a378882ffa531141205e92e9'],
                },
            },
            {
                'networkId': 42,
            },
        ],
    },
    {
        'name': 'Decent Exchange',
        'homepage_url': 'https://decent.exchange/',
        'app_url' : 'https://decent.exchange/',
        'header_img' : 'decentexchange.png',
        'networks': [
            {
                'networkId': 1,
            },
            {
                'networkId': 42,
            },
        ],
    },
    {
        'name' : 'Tokenlon',
        'homepage_url' : 'https://tokenlon.token.im/',
        'header_img': 'tokenlon.png',
        'logo_img': 'tokenlon.png',
        'networks' : [
            {
                'networkId': 1,
                'static_order_fields' : {
                    'fee_recipient_addresses' : ['0x6f7ae872e995f98fcd2a7d3ba17b7ddfb884305f'],
                 },
            },
        ],
     },
     {
        'name': 'Shark Relay',
        'homepage_url': 'https://sharkrelay.com/',
        'app_url': 'https://app.sharkrelay.com/',
        'header_img': 'sharkrelay.png',
        'logo_img': 'shark.png',
        'networks': [
            {
                'networkId': 1,
                'sra_http_endpoint': 'https://api.sharkrelay.com/api',
                'sra_ws_endpoint': 'wss://app.sharkrelay.com/ws',
                'static_order_fields': {
                    'fee_recipient_addresses': ['0x55890b06f0877a01bb5349d93b202961f8e27a9b'],
                },
            },
            {
                'networkId': 42,
                'sra_ws_endpoint': 'wss://kovan.sharkrelay.com/ws',
                'static_order_fields': {
                    'fee_recipient_addresses': ['0x2e5a815fb70ae9e27188d9a4e72965e55b6f77b2'],
                },
            },
        ],
    },
    {
      'name': 'Bamboo Relay',
      'homepage_url': 'https://bamboorelay.com/',
      'app_url': 'https://bamboorelay.com/',
      'header_img': 'bamboorelay.png',
      'logo_img': 'bamboorelay.png',
      'networks': [
          {
              'networkId': 1,
              'sra_http_endpoint': 'https://sra.bamboorelay.com/main',
              'static_order_fields': {
                  'fee_recipient_addresses': ['0x5dd835a893734b8d556eccf87800b76dda5aedc5'],
              },
          },
          {
              'networkId': 3,
              'sra_http_endpoint': 'https://sra.bamboorelay.com/ropsten',
          },
          {
              'networkId': 4,
              'sra_http_endpoint': 'https://sra.bamboorelay.com/rinkeby',
          },
          {
              'networkId': 42,
              'sra_http_endpoint': 'https://sra.bamboorelay.com/kovan',
          },
      ],
    },
    {
      'name': 'Instex',
      'homepage_url': 'https://instex.io/',
      'app_url': 'https://app.instex.io/',
      'header_img': 'instex.png',
      'logo_img': 'instex.png',
      'networks': [
          {
              'networkId': 1,
          },
          {
              'networkId': 42,
          },
      ],
    },
    {
      'name': 'StarBitEx',
      'homepage_url': 'https://www.starbitex.com/',
      'app_url': 'https://www.starbitex.com/Trade',
      'header_img': 'starbitex.png',
      'logo_img': 'starbitex.png',
      'networks': [
        {
          'networkId': 1,
          'static_order_fields' : {
            'fee_recipient_addresses': ['0x8124071f810d533ff63de61d0c98db99eeb99d64'],
          },
        },
      ],
    },
    {
      'name': 'Mobidex',
      'homepage_url': 'https://mobidex.io/',
      'header_img': 'mobidex.png',
      'logo_img': 'mobidex.png',
      'networks': [
        {
          'networkId': 42,
        },
      ],
    },
    {
      'name': 'LedgerDex',
      'homepage_url': 'https://www.ledgerdex.com/',
      'app_url': 'https://app.ledgerdex.com/',
      'header_img': 'ledgerdex.png',
      'logo_img': 'ledgerdex.png',
      'networks': [
          {
              'networkId': 1,
              'static_order_fields': {
                  'fee_recipient_addresses': ['0x4524baa98f9a3b9dec57caae7633936ef96bd708'],
              },
          },
          {
              'networkId': 3,
          },
          {
              'networkId': 4,
          },
          {
              'networkId': 42,
          },
      ],
    },
    {
      'name': 'Bloqboard',
      'homepage_url': 'https://bloqboard.com/',
      'app_url': 'https://app.bloqboard.com/',
      'header_img': 'bloqboard.png',
      'logo_img': 'bloqboard.png',
      'networks': [
        {
          'networkId': 42,
        },
      ],
    },
];
