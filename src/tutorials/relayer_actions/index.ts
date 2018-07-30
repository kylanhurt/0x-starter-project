import {
    ZeroEx,
    ZeroExConfig,
} from '0x.js';
import {
    FeesRequest,
    FeesResponse,
    HttpClient,
    Order,
    OrderbookRequest,
    OrderbookResponse,
    SignedOrder,
} from '@0xproject/connect';
import { BigNumber } from '@0xproject/utils';
import * as Web3 from 'web3';

const mainAsync = async () => {
    // Provider pointing to local TestRPC on default port 8545
    const provider = new Web3.providers.HttpProvider('http://localhost:8545');

    // Instantiate 0x.js instance
    const zeroExConfig: ZeroExConfig = {
        networkId: 50, // testrpc, change to 1 for mainnet
    };
    const zeroEx = new ZeroEx(provider, zeroExConfig);

    // Instantiate relayer client pointing to a local server on port 3000
    // we create an HttpClient instance with a url pointing to a local standard
    // relayer api http server running at http://localhost:3000. The HttpClient
    // is our programmatic gateway to any relayer that conforms to the standard
    // relayer api http standard.
    const relayerApiUrl = 'http://localhost:3000/v0';
    const relayerClient = new HttpClient(relayerApiUrl);

    // Get exchange contract address
    // we use 0x.js to get the address of the exchange contract on the current network.
    const EXCHANGE_ADDRESS = await zeroEx.exchange.getContractAddress();

    // Get token information, can make tokens constants at top of file
    const wethTokenInfo = await zeroEx.tokenRegistry.getTokenBySymbolIfExistsAsync('WETH');
    const zrxTokenInfo = await zeroEx.tokenRegistry.getTokenBySymbolIfExistsAsync('ZRX');

    // Check if either getTokenBySymbolIfExistsAsync query resulted in undefined
    // Addresses of other tokens can be acquired though the tokenRegistry field of
    // a ZeroEx instance or on Etherscan.
    if (wethTokenInfo === undefined || zrxTokenInfo === undefined) {
        throw new Error('could not find token info');
    }

    // Get token contract addresses
    const WETH_ADDRESS = wethTokenInfo.address;
    const ZRX_ADDRESS = zrxTokenInfo.address;

    // Get all available addresses, can get from Edge for mainnet
    const addresses = await zeroEx.getAvailableAddressesAsync();

    // Get the first address, this address is preloaded with a ZRX balance from the snapshot
    const zrxOwnerAddress = addresses[0];

    // Assign other addresses as WETH owners
    const wethOwnerAddresses = addresses.slice(1);

    // Set WETH and ZRX unlimited allowances for all addresses. Would only need to
    // do one per counterparty
    const setZrxAllowanceTxHashes = await Promise.all(addresses.map(address => {
        return zeroEx.token.setUnlimitedProxyAllowanceAsync(ZRX_ADDRESS, address);
    }));
    const setWethAllowanceTxHashes = await Promise.all(addresses.map(address => {
        return zeroEx.token.setUnlimitedProxyAllowanceAsync(WETH_ADDRESS, address);
    }));
    await Promise.all(setZrxAllowanceTxHashes.concat(setWethAllowanceTxHashes).map(tx => {
        return zeroEx.awaitTransactionMinedAsync(tx);
    }));

    // Deposit ETH and generate WETH tokens for each address in wethOwnerAddresses
    // will want to check WETH balance first
    const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(5), wethTokenInfo.decimals);
    const depositTxHashes = await Promise.all(wethOwnerAddresses.map(address => {
        return zeroEx.etherToken.depositAsync(WETH_ADDRESS, ethToConvert, address);
    }));
    await Promise.all(depositTxHashes.map(tx => {
        return zeroEx.awaitTransactionMinedAsync(tx);
    }));

    // Generate and submit orders with increasing ZRX/WETH exchange rate
    // do not need changing exchange rate, in reality
    await Promise.all(wethOwnerAddresses.map(async (address, index) => {
        // Programmatically determine the exchange rate based on the index of address in wethOwnerAddresses
        const exchangeRate = (index + 1) * 10; // ZRX/WETH, will need to get real exchange rate
        const makerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(5), wethTokenInfo.decimals);
        const takerTokenAmount = makerTokenAmount.mul(exchangeRate);

        // Generate fees request for the order
        const ONE_HOUR_IN_MS = 3600000;
        const feesRequest: FeesRequest = {
            exchangeContractAddress: EXCHANGE_ADDRESS,
            maker: address,
            taker: ZeroEx.NULL_ADDRESS,
            makerTokenAddress: WETH_ADDRESS,
            takerTokenAddress: ZRX_ADDRESS,
            makerTokenAmount,
            takerTokenAmount,
            expirationUnixTimestampSec: new BigNumber(Date.now() + ONE_HOUR_IN_MS),
            salt: ZeroEx.generatePseudoRandomSalt(),
        };

        // Send fees request to relayer and receive a FeesResponse instance
        const feesResponse: FeesResponse = await relayerClient.getFeesAsync(feesRequest);
        console.log('feesResponse is: ', feesResponse);
        // Combine the fees request and response to from a complete order
        const order: Order = {
            ...feesRequest,
            ...feesResponse,
        };

        // Create orderHash
        const orderHash = ZeroEx.getOrderHashHex(order);

        // Sign orderHash and produce a ecSignature
        const ecSignature = await zeroEx.signOrderHashAsync(orderHash, address, false);

        // Append signature to order
        const signedOrder: SignedOrder = {
            ...order,
            ecSignature,
        };

        // Submit order to relayer
        await relayerClient.submitOrderAsync(signedOrder);
    }));

    // Generate orderbook request for ZRX/WETH pair
    const orderbookRequest: OrderbookRequest = {
        baseTokenAddress: ZRX_ADDRESS,
        quoteTokenAddress: WETH_ADDRESS,
    };

    // Send orderbook request to relayer and receive an OrderbookResponse instance
    const orderbookResponse: OrderbookResponse = await relayerClient.getOrderbookAsync(orderbookRequest);
    console.log('orderbookResponse is: ', orderbookResponse);

    // Because we are looking to exchange our ZRX for WETH, we get the bids side of the order book
    // Sort them with the best rate first
    const sortedBids = orderbookResponse.bids.sort((orderA, orderB) => {
        const orderRateA = (new BigNumber(orderA.makerTokenAmount)).div(new BigNumber(orderA.takerTokenAmount));
        const orderRateB = (new BigNumber(orderB.makerTokenAmount)).div(new BigNumber(orderB.takerTokenAmount));
        return orderRateB.comparedTo(orderRateA);
    });

    // Calculate and print out the WETH/ZRX exchange rates
    const rates = sortedBids.map(order => {
        const rate = (new BigNumber(order.makerTokenAmount)).div(new BigNumber(order.takerTokenAmount));
        return (rate.toString() + ' WETH/ZRX');
    });
    console.log('rates: ', rates);

    // Get balances before the fill
    const zrxBalanceBeforeFill = await zeroEx.token.getBalanceAsync(ZRX_ADDRESS, zrxOwnerAddress);
    const wethBalanceBeforeFill = await zeroEx.token.getBalanceAsync(WETH_ADDRESS, zrxOwnerAddress);
    console.log('ZRX Before: ' + ZeroEx.toUnitAmount(zrxBalanceBeforeFill, zrxTokenInfo.decimals).toString());
    console.log('WETH Before: ' + ZeroEx.toUnitAmount(wethBalanceBeforeFill, wethTokenInfo.decimals).toString());

    // Completely fill the best bid
    const bidToFill = sortedBids[0];
    console.log('bidToFill is: ', bidToFill);
    const fillTxHash = await zeroEx.exchange.fillOrderAsync(bidToFill, bidToFill.takerTokenAmount, true, zrxOwnerAddress);
    console.log('fillTxHash is: ', fillTxHash);
    await zeroEx.awaitTransactionMinedAsync(fillTxHash);

    // Get balances after the fill
    const zrxBalanceAfterFill = await zeroEx.token.getBalanceAsync(ZRX_ADDRESS, zrxOwnerAddress);
    console.log('ZRX After: ' + ZeroEx.toUnitAmount(zrxBalanceAfterFill, zrxTokenInfo.decimals).toString());
    const wethBalanceAfterFill = await zeroEx.token.getBalanceAsync(WETH_ADDRESS, zrxOwnerAddress);
    console.log('WETH After: ' + ZeroEx.toUnitAmount(wethBalanceAfterFill, wethTokenInfo.decimals).toString());
};

mainAsync().catch(console.error);
