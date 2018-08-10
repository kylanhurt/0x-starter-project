import { DecodedLogEvent, ZeroEx } from '0x.js';
import { BigNumber } from '@0xproject/utils';
import * as Web3 from 'web3';

const MAINNET_NETWORK_ID = 1;

// Provider pointing to local TestRPC on default port 8545
const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');

// Instantiate 0x.js instance
const configs = {
    networkId: MAINNET_NETWORK_ID,
};
const zeroEx = new ZeroEx(provider, configs);

// Number of decimals to use (for ETH and ZRX)
const DECIMALS = 18;

const mainAsync = async () => {
    // Addresses
    const WETH_ADDRESS = zeroEx.etherToken.getContractAddressIfExists() as string; // The wrapped ETH token contract
    console.log('WETH_ADDRESS is: ', WETH_ADDRESS);
    const ZRX_ADDRESS = zeroEx.exchange.getZRXTokenAddress(); // The ZRX token contract
    console.log('ZRX_ADDRES is: ', ZRX_ADDRESS);
    // The Exchange.sol address (0x exchange smart contract)
    const EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress();
    console.log('EXCHANGE_ADDRESS is: ', EXCHANGE_ADDRESS);

    // Set our addresses
    const relayerAddress = '0x00AC112bF28AE1D0e9569aF6844298283515F4b0'.toLowerCase();
    const takerAddress = '0xEd113C53b848E7e50950C9358DCAECFd6feBf747'.toLowerCase();
    const makerAddress = '0xE830848074C77e0a836C999e45cc38fe451927e2'.toLowerCase();
    // Unlimited allowances to 0x proxy contract for maker and taker
    const setMakerAllowTxHash = await zeroEx.token.setUnlimitedProxyAllowanceAsync(ZRX_ADDRESS, makerAddress);
    console.log('setMakerAllowTxHash is: ', setMakerAllowTxHash);
    await zeroEx.awaitTransactionMinedAsync(setMakerAllowTxHash);

    const setTakerAllowTxHash = await zeroEx.token.setUnlimitedProxyAllowanceAsync(WETH_ADDRESS, takerAddress);
    console.log('setTakerAllowTxHash is: ', setTakerAllowTxHash);
    await zeroEx.awaitTransactionMinedAsync(setTakerAllowTxHash);
    console.log('Taker allowance mined...');

    // Deposit WETH
    // const ethAmount = new BigNumber(0.1);
    // const ethToConvert = ZeroEx.toBaseUnitAmount(ethAmount, DECIMALS); // Number of ETH to convert to WETH

    // const convertEthTxHash = await zeroEx.etherToken.depositAsync(WETH_ADDRESS, ethToConvert, takerAddress);
    // console.log('convertEthTxHash is: ', convertEthTxHash);
    // await zeroEx.awaitTransactionMinedAsync(convertEthTxHash);
    // console.log(`${ethAmount} ETH -> WETH conversion mined...`);

    // Generate order
    const order = {
        maker: makerAddress, // Ethereum address of our Maker.
        taker: takerAddress, // Ethereum address of our Taker.
        feeRecipient: relayerAddress, // Ethereum address of our Relayer (none for now).
        makerTokenAddress: ZRX_ADDRESS, // The token address the Maker is offering.
        takerTokenAddress: WETH_ADDRESS, // The token address the Maker is requesting from the Taker.
        exchangeContractAddress: EXCHANGE_ADDRESS, // The exchange.sol address.
        salt: ZeroEx.generatePseudoRandomSalt(), // Random number to make the order (and therefore its hash) unique.
        makerFee: ZeroEx.toBaseUnitAmount(new BigNumber(5), 18), // How many ZRX the Maker will pay as a fee to the Relayer.
        takerFee: ZeroEx.toBaseUnitAmount(new BigNumber(5), 18), // How many ZRX the Taker will pay as a fee to the Relayer.
        makerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(0.4), DECIMALS), // Base 18 decimals, The amount of ZRX token the Maker is offering.
        takerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(0.01), DECIMALS), // Base 18 decimals, The amount of WETH token the Maker is requesting from the Taker.
        expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000), // When will the order expire (in unix time), Valid for up to an hour
    };

    // Create orderHash
    const orderHash = ZeroEx.getOrderHashHex(order);
    console.log('orderHash is: ', orderHash);

    // Signing orderHash -> ecSignature
    const shouldAddPersonalMessagePrefix = false;
    const ecSignature = await zeroEx.signOrderHashAsync(orderHash, makerAddress, shouldAddPersonalMessagePrefix);
    console.log('ecSignature is: ', ecSignature);
    // Appending signature to order
    const signedOrder = {
        ...order,
        ecSignature,
    };
    // Verify that order is fillable
    await zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder);

    // Try to fill order
    const shouldThrowOnInsufficientBalanceOrAllowance = true;
    // the amount of tokens (in our case WETH) the Taker wants to fill.
    const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(0.05), DECIMALS);

    // Filling order
    const txHash = await zeroEx.exchange.fillOrderAsync(
        signedOrder,
        fillTakerTokenAmount,
        shouldThrowOnInsufficientBalanceOrAllowance,
        takerAddress,
    )

    // Transaction receipt
    const txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash);
    console.log('FillOrder transaction receipt: ', txReceipt);
};

mainAsync().catch(console.error);
