import { expect } from 'chai';
import {Provider} from "../src";


describe('Provider', () => {
    const provider = new Provider("https://testnet.era.zksync.dev");

    it('should return address of main contract', async() => {
        const mainContract = await provider.getMainContractAddress();
        expect(mainContract).not.to.be.null;
    });
});