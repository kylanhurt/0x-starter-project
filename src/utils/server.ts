import {ZeroEx} from '0x.js';
import { schemas as zeroExSchemas } from '@0xproject/json-schemas';
import { BigNumber } from '@0xproject/utils';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as mongoose from 'mongoose';
import * as mysql from 'mysql';
import {
    connection as WebSocketConnection,
    server as WebSocketServer,
} from 'websocket';

import { models } from './Models';

// Type declarations
interface ZeroExOrder {
    makerTokenAddress: string;
    takerTokenAddress: string;
}

// Global state
const orders: ZeroExOrder[] = [];
let socketConnection: WebSocketConnection | undefined;

// DB config
mongoose.connect('mongodb://localhost:27017/cb');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Global state
const ZRX_TOKEN_DECIMALS = 18; // need to replace

// HTTP Server
const app = express();
app.use(bodyParser.json());
app.get('/v0/orderbook', (req, res) => {
    console.log('HTTP: GET orderbook');
    const baseTokenAddress = req.param('baseTokenAddress');
    const quoteTokenAddress = req.param('quoteTokenAddress');
    const renderedOrderBook = renderOrderBook(baseTokenAddress, quoteTokenAddress);
    console.log('orderbook is: ', renderedOrderBook);
    res.status(201).send(renderOrderBook(baseTokenAddress, quoteTokenAddress));
});

app.post('/v0/order', (req, res) => {
    console.log('HTTP: POST order');
    const order = req.body;
    if (socketConnection !== undefined) {
        const message = {
            type: 'update',
            channel: 'orderbook',
            requestId: 1,
            payload: order,
        };
        socketConnection.send(JSON.stringify(message));
    }
    console.log('egSignature is: ', JSON.stringify(order.ecSignature));
    const userOrder = new models.Order({
        ...order,
        _id: new mongoose.Types.ObjectId(),
    });
    console.log('userOrder set:', userOrder);
    userOrder.save(err => {
        console.log('error:' + err);
    });
    res.status(201).send({order});
});

app.post('/v0/fees', (req, res) => {
    console.log('HTTP: POST fees');
    const makerFee = ZeroEx.toBaseUnitAmount(new BigNumber(0.1), ZRX_TOKEN_DECIMALS);
    const takerFee = ZeroEx.toBaseUnitAmount(new BigNumber(0.15), ZRX_TOKEN_DECIMALS);
    const fees = {
        feeRecipient: '0x03aaea12a47b8e688ed2f882b19fb3a3471daa0e',
        makerFee,
        takerFee,
    };
    console.log('fees is: ', fees);
    res.status(201).send(fees);
});
app.listen(3000, () => console.log('Standard relayer API (HTTP) listening on port 3000!'));

// WebSocket server
const server = http.createServer((request, response) => {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(3001, () => {
    console.log('Standard relayer API (WS) listening on port 3001!');
});
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
});
wsServer.on('request', request => {
    socketConnection = request.accept();
    console.log('WS: Connection accepted');
    socketConnection.on('message', message => {
        if (message.type === 'utf8' && message.utf8Data !== undefined) {
            const parsedMessage = JSON.parse(message.utf8Data);
            console.log('WS: Received Message: ' + parsedMessage.type);
            const snapshotNeeded = parsedMessage.payload.snapshot;
            const baseTokenAddress = parsedMessage.payload.baseTokenAddress;
            const quoteTokenAddress = parsedMessage.payload.quoteTokenAddress;
            const requestId = parsedMessage.requestId;
            if (snapshotNeeded && socketConnection !== undefined) {
                const orderbook = renderOrderBook(baseTokenAddress, quoteTokenAddress);
                const returnMessage = {
                    type: 'snapshot',
                    channel: 'orderbook',
                    requestId,
                    payload: orderbook,
                };
                socketConnection.sendUTF(JSON.stringify(returnMessage));
            }
        }
    });
    socketConnection.on('close', (reasonCode, description) => {
        console.log('WS: Peer disconnected');
    });
});

function renderOrderBook(baseTokenAddress: string, quoteTokenAddress: string): object {
    const bids = orders.filter(order => {
        return (order.takerTokenAddress === baseTokenAddress) &&
               (order.makerTokenAddress === quoteTokenAddress);
    });
    const asks = orders.filter(order => {
        return (order.takerTokenAddress === quoteTokenAddress) &&
               (order.makerTokenAddress === baseTokenAddress);
    });
    return {
        bids,
        asks,
    };
}
