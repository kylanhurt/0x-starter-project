import {ZeroEx} from '0x.js';
import { BigNumber } from '@0xproject/utils';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as mysql from 'mysql';
import {
    connection as WebSocketConnection,
    server as WebSocketServer,
} from 'websocket';

// Type declarations
interface Order {
    makerTokenAddress: string;
    takerTokenAddress: string;
}

// MySQL config

const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'cb',
});
mysqlConnection.connect();

// Global state
const orders: Order[] = [];
let socketConnection: WebSocketConnection | undefined;
const orderBook = [];
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
    orders.push(order);
    if (socketConnection !== undefined) {
        const message = {
            type: 'update',
            channel: 'orderbook',
            requestId: 1,
            payload: order,
        };
        socketConnection.send(JSON.stringify(message));
    }
    const { maker, taker, feeRecipient, makerTokenAddress, takerTokenAddress, exchangeContractAddress, salt, makerTokenAmount, takerTokenAmount, expirationUnixTimestampSec, makerFee, takerFee, ecSignature } = order;
    console.log('egSignature is: ', JSON.stringify(order.ecSignature));
    const stringifiedSignature = `${ecSignature.v}${ecSignature.r}${ecSignature.s}`;
    const query = `INSERT INTO ORDERS (maker, taker, feeRecipient, makerTokenAddress, takerTokenAddress, exchangeContractAddress, salt, makerTokenAmount, takerTokenAmount, expirationUnixTimestampSec, makerFee, takerFee, ecSignature)
                    VALUES ('${maker}', '${taker}', '${feeRecipient}', '${makerTokenAddress}', '${takerTokenAddress}', '${exchangeContractAddress}', '${salt}','${makerTokenAmount}', '${takerTokenAmount}', '${expirationUnixTimestampSec}', '${makerFee}', '${takerFee}', '${stringifiedSignature}')`;
    console.log('Query is: ', query);
    mysqlConnection.query(query, (error, results, fields) => {
        if (error) { throw error; }
    });
    console.log('order is: ', order);
    res.status(201).send({});
});
app.post('/v0/fees', (req, res) => {
    console.log('HTTP: POST fees');
    const makerFee = ZeroEx.toBaseUnitAmount(new BigNumber(0.6), 18);
    const takerFee = ZeroEx.toBaseUnitAmount(new BigNumber(0.8), 18);
    const fees = {
        feeRecipient: '0x03aaea12a47b8e688ed2f882b19fb3a3471daa0e'.toLowerCase(),
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
