// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {VRFV2PlusWrapperConsumerBase} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract RandomNumberGenerator is VRFV2PlusWrapperConsumerBase, ConfirmedOwner {
    uint256 public randomResult; // Store the random result
    uint256 public requestId;    // Store the request ID for tracking
    uint256 reqPrice;

    // Chainlink VRF Configuration
    uint32 private constant CALLBACK_GAS_LIMIT = 250000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Pre-configured wrapper address
    address private constant WRAPPER_ADDRESS = 0x195f15F2d49d693cE265b4fB0fdDbE15b1850Cc1;

    constructor() 
        ConfirmedOwner(msg.sender) 
        VRFV2PlusWrapperConsumerBase(WRAPPER_ADDRESS) 
    {}

    // Request a random number between 1 and 1000
    function requestRandomNumber() external onlyOwner returns (uint256) {
        bytes memory extraArgs = VRFV2PlusClient._argsToBytes(
            VRFV2PlusClient.ExtraArgsV1({nativePayment: false}) // Pay in native tokens
        );

        (requestId, reqPrice) = requestRandomness(
                CALLBACK_GAS_LIMIT,
                REQUEST_CONFIRMATIONS,
                NUM_WORDS,
                extraArgs ///// PASS IN EXTRA ARGS /////
            );
        return requestId;
    }

    // Fulfill the random number request
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory randomWords
    ) internal override {
        require(_requestId == requestId, "Invalid request ID");
        randomResult = (randomWords[0] % 1000) + 1; // Scale random number to range 1-1000
    }
}
