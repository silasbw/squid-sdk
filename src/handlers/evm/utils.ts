import { ChainData, SquidData } from "@0xsquid/squid-types";

import { OverrideParams, Contract, GasData, RpcProvider } from "../../types";
import axios from "axios";

export class Utils {
  async validateNativeBalance({
    fromProvider,
    sender,
    amount,
    fromChain
  }: {
    fromProvider: RpcProvider;
    sender: string;
    amount: bigint;
    fromChain: ChainData;
  }) {
    const balance = await fromProvider.getBalance(sender);

    if (amount > balance) {
      throw new Error(
        `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`
      );
    }

    return {
      isApproved: true,
      message: `User has the expected balance ${amount} of ${fromChain.nativeCurrency.symbol}`
    };
  }

  async validateTokenBalance({
    amount,
    fromTokenContract,
    sender,
    fromChain
  }: {
    amount: bigint;
    fromTokenContract: Contract;
    sender: string;
    fromChain: ChainData;
  }) {
    const balance = await (fromTokenContract as Contract).balanceOf(sender);

    if (amount > balance) {
      throw new Error(
        `Insufficient funds for account: ${sender} on chain ${fromChain.chainId}`
      );
    }

    return {
      isApproved: true,
      message: `User has the expected balance ${amount} of ${await (
        fromTokenContract as Contract
      ).symbol()}`
    };
  }

  async validateAllowance({
    amount,
    fromTokenContract,
    sender,
    router
  }: {
    amount: bigint;
    fromTokenContract: Contract;
    sender: string;
    router: string;
  }) {
    const allowance = await (fromTokenContract as Contract).allowance(
      sender,
      router
    );

    return !(amount > allowance);
  }

  getGasData = ({
    transactionRequest,
    overrides
  }: {
    transactionRequest: SquidData;
    overrides?: OverrideParams;
  }): GasData => {
    const { gasLimit, gasPrice, maxPriorityFeePerGas, maxFeePerGas } =
      transactionRequest;

    const gasParams = maxPriorityFeePerGas
      ? {
          gasLimit,
          maxPriorityFeePerGas,
          maxFeePerGas
        }
      : {
          gasLimit,
          gasPrice
        };
    axios.get("", {
      params: overrides
        ? { ...gasParams, ...overrides }
        : (gasParams as GasData)
    });
    return overrides ? { ...gasParams, ...overrides } : (gasParams as GasData);
  };
}