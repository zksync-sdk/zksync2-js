import { BytesLike, BigNumberish, ethers, TransactionRequest as EthersTransactionRequest } from 'ethers';
import {serializeEip712, EIP712_TX_TYPE, parseEip712, sleep} from './utils';

// 0x-prefixed, hex encoded, ethereum account address
export type Address = string;
// 0x-prefixed, hex encoded, ECDSA signature.
export type Signature = string;

// Ethereum network
export enum Network {
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Goerli = 5,
    Localhost = 9
}

export enum PriorityQueueType {
    Deque = 0,
    HeapBuffer = 1,
    Heap = 2
}

export enum PriorityOpTree {
    Full = 0,
    Rollup = 1
}

export enum TransactionStatus {
    NotFound = 'not-found',
    Processing = 'processing',
    Committed = 'committed',
    Finalized = 'finalized'
}

export type PaymasterParams = {
    paymaster: Address;
    paymasterInput: BytesLike;
};

export type Eip712Meta = {
    gasPerPubdata?: BigNumberish;
    factoryDeps?: BytesLike[];
    customSignature?: BytesLike;
    paymasterParams?: PaymasterParams;
};

export type BlockTag =
    | BigNumberish
    | string // block hash
    | 'committed'
    | 'finalized'
    | 'latest'
    | 'earliest'
    | 'pending';

// TODO (SMA-1585): Support create2 variants.
export type DeploymentType = 'create' | 'createAccount';

export interface Token {
    l1Address: Address;
    l2Address: Address;
    name: string;
    symbol: string;
    decimals: number;
}

export interface Fee {
    readonly gasLimit: bigint;
    readonly gasPerPubdataLimit: bigint;
    readonly maxPriorityFeePerGas: bigint;
    readonly maxFeePerGas: bigint;

}

export interface MessageProof {
    id: number;
    proof: string[];
    root: string;
}

export class TransactionResponse extends ethers.TransactionResponse {
    readonly l1BatchNumber: null | number;
    readonly l1BatchTxIndex: null | number;

    constructor(params: any, provider: ethers.Provider) {
        super(params, provider);
        this.l1BatchNumber = params.l1BatchNumber;
        this.l1BatchTxIndex = params.l1BatchTxIndex;
    }

    override async wait(confirmations?: number): Promise<TransactionReceipt> {
        return (await super.wait(confirmations)) as TransactionReceipt;
    }

    override async getTransaction(): Promise<TransactionResponse> {
        return (await super.getTransaction()) as TransactionResponse;
    }

    override replaceableTransaction(startBlock: number): TransactionResponse {
        return new TransactionResponse(super.replaceableTransaction(startBlock), this.provider);
    }

    override async getBlock(): Promise<Block> {
        return (await super.getBlock()) as Block;
    }

    async waitFinalize(): Promise<TransactionReceipt> {
        while (true) {
            const receipt = await this.wait();
            const block = await this.provider.getBlock('finalized');
            if (receipt.blockNumber && receipt.blockNumber <= block!.number) {
                return (await this.provider.getTransactionReceipt(receipt.hash)) as TransactionReceipt;
            } else {
                await sleep(500);
            }
        }
    }

    override toJSON(): any {
        const { l1BatchNumber, l1BatchTxIndex } = this;

        return {
            ...super.toJSON(),
            l1BatchNumber,
            l1BatchTxIndex
        };
    }
}

export class TransactionReceipt extends ethers.TransactionReceipt {
    readonly l1BatchNumber: null | number;
    readonly l1BatchTxIndex: null | number;
    readonly l2ToL1Logs: L2ToL1Log[];
    readonly _logs: ReadonlyArray<Log>;

    constructor(params: any, provider: ethers.Provider) {
        super(params, provider);
        this.l1BatchNumber = params.l1BatchNumber;
        this.l1BatchTxIndex = params.l1BatchTxIndex;
        this.l2ToL1Logs = params.l2ToL1Logs;
        this._logs = Object.freeze(params.logs.map((log) => {
            return new Log(log, provider);
        }));
    }

    override get logs(): ReadonlyArray<Log> {
        return this._logs;
    }

    override getBlock(): Promise<Block> {
        return super.getBlock() as Promise<Block>;
    }

    override getTransaction(): Promise<TransactionResponse> {
        return super.getTransaction() as Promise<TransactionResponse>;
    }

    override toJSON(): any {
        const { l1BatchNumber, l1BatchTxIndex, l2ToL1Logs } = this;
        return {
            ...super.toJSON(),
            l1BatchNumber,
            l1BatchTxIndex,
            l2ToL1Logs
        };
    }
}

export class Block extends ethers.Block {
    readonly l1BatchNumber: null | number;
    readonly l1BatchTimestamp: null | number;

    constructor(params: any, provider: ethers.Provider) {
        super(params, provider);
        this.l1BatchNumber = params.l1BatchNumber;
        this.l1BatchTimestamp = params.l1BatchTxIndex;
    }

    override toJSON(): any {
        const { l1BatchNumber, l1BatchTimestamp: l1BatchTxIndex } = this;
        return {
            ...super.toJSON(),
            l1BatchNumber,
            l1BatchTxIndex
        };
    }

    override get prefetchedTransactions(): TransactionResponse[] {
        return super.prefetchedTransactions as TransactionResponse[];
    }

    override getTransaction(indexOrHash: number | string): Promise<TransactionResponse> {
        return super.getTransaction(indexOrHash) as Promise<TransactionResponse>;
    }
}

export class Log extends ethers.Log {
    readonly l1BatchNumber: null | number;

    constructor(params: any, provider: ethers.Provider) {
        super(params, provider);
        this.l1BatchNumber = params.l1BatchNumber;
    }

    override toJSON(): any {
        const { l1BatchNumber } = this;
        return {
            ...super.toJSON(),
            l1BatchNumber
        };
    }

    override async getBlock(): Promise<Block> {
        return (await super.getBlock()) as Block;
    }

    override async getTransaction(): Promise<TransactionResponse> {
        return (await super.getTransaction()) as TransactionResponse;
    }

    override async getTransactionReceipt(): Promise<TransactionReceipt> {
        return (await super.getTransactionReceipt()) as TransactionReceipt;
    }
}

export interface TransactionLike extends ethers.TransactionLike {
    customData?: null | Eip712Meta;
}

export class Transaction extends ethers.Transaction {
    customData: null | Eip712Meta;

    static override from(value: string | TransactionLike): Transaction {
        if (typeof value === 'string') {
            const payload = ethers.getBytes(value);
            if (payload[0] !== EIP712_TX_TYPE) {
                return Transaction.from(ethers.Transaction.from(value));
            } else {
                return Transaction.from(parseEip712(payload));
            }
        } else {
            const tx = ethers.Transaction.from(value) as Transaction;
            tx.customData = value?.customData ?? null;
            return tx;
        }
    }

    override get serialized(): string {
        if (this.customData == null && this.type != EIP712_TX_TYPE) {
            return super.serialized;
        }
        return serializeEip712(this, this.signature);
    }

    override get unsignedSerialized(): string {
        if (this.customData == null && this.type != EIP712_TX_TYPE) {
            return super.unsignedSerialized;
        }
        return serializeEip712(this);
    }

    override toJSON(): any {
        const { customData } = this;
        return {
            ...super.toJSON(),
            customData
        };
    }

    override get typeName(): string {
        if (this.type === EIP712_TX_TYPE) {
            return 'zksync';
        } else {
            return super.typeName;
        }
    }
}

export interface L2ToL1Log {
    blockNumber: number;
    blockHash: string;
    l1BatchNumber: number;
    transactionIndex: number;
    shardId: number;
    isService: boolean;
    sender: string;
    key: string;
    value: string;
    transactionHash: string;
    logIndex: number;
}

export interface TransactionRequest extends EthersTransactionRequest {
    customData?: Eip712Meta;
}

export interface PriorityOpResponse extends TransactionResponse {
    waitL1Commit(confirmation?: number): Promise<ethers.TransactionReceipt>;
}

export type BalancesMap = { [key: string]: bigint };

export interface DeploymentInfo {
    sender: Address;
    bytecodeHash: string;
    deployedAddress: Address;
}

export interface ApprovalBasedPaymasterInput {
    type: 'ApprovalBased';
    token: Address;
    minimalAllowance: BigNumberish;
    innerInput: BytesLike;
}

export interface GeneralPaymasterInput {
    type: 'General';
    innerInput: BytesLike;
}

export interface EthereumSignature {
    v: number;
    r: BytesLike;
    s: BytesLike;
}

export type PaymasterInput = ApprovalBasedPaymasterInput | GeneralPaymasterInput;

export enum AccountAbstractionVersion {
    None = 0,
    Version1 = 1
}

export enum AccountNonceOrdering {
    Sequential = 0,
    Arbitrary = 1
}

export interface ContractAccountInfo {
    supportedAAVersion: AccountAbstractionVersion;
    nonceOrdering: AccountNonceOrdering;
}

export interface BatchDetails {
    number: number;
    timestamp: number;
    l1TxCount: number;
    l2TxCount: number;
    rootHash?: string;
    status: string;
    commitTxHash?: string;
    committedAt?: Date;
    proveTxHash?: string;
    provenAt?: Date;
    executeTxHash?: string;
    executedAt?: Date;
    l1GasPrice: number;
    l2FairGasPrice: number;
}

export interface BlockDetails {
    number: number;
    timestamp: number;
    l1TxCount: number;
    l2TxCount: number;
    rootHash?: string;
    status: string;
    commitTxHash?: string;
    committedAt?: Date;
    proveTxHash?: string;
    provenAt?: Date;
    executeTxHash?: string;
    executedAt?: Date;
}

export interface TransactionDetails {
    isL1Originated: boolean;
    status: string;
    fee: BigNumberish;
    initiatorAddress: Address;
    receivedAt: Date;
    ethCommitTxHash?: string;
    ethProveTxHash?: string;
    ethExecuteTxHash?: string;
}

export interface FullDepositFee {
    maxFeePerGas?: BigInt;
    maxPriorityFeePerGas?: BigInt;
    gasPrice?: BigInt;
    baseCost: BigInt;
    l1GasLimit: BigInt;
    l2GasLimit: BigInt;
}