// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

contract ReturnDataTypes {
    function returnUint8(uint8 count) external pure returns (uint8) {
        return count;
    }

    function returnInt8(int8 count) external pure returns (int8) {
        return count;
    }

    function returnInt8Multiple(int8 count) external pure returns (int8, int8) {
        return (count, count + 20);
    }

    function returnUint16(uint16 count) external pure returns (uint16) {
        return count;
    }

    function returnInt16(int16 count) external pure returns (int16) {
        return count;
    }

    function returnUint24(uint24 count) external pure returns (uint24) {
        return count;
    }

    function returnInt24(int24 count) external pure returns (int24) {
        return count;
    }

    function returnUint32(uint32 count) external pure returns (uint32) {
        return count;
    }

    function returnMultipleTypeParams(
        uint32 count
    ) external pure returns (uint32, uint64, string memory) {
        return (count, count - 1, "OK");
    }

    function returnInt32(int32 count) external pure returns (int32) {
        return count;
    }

    function returnUint40(uint40 count) external pure returns (uint40) {
        return count;
    }

    function returnMultipleInt40(
        int40 count
    ) external pure returns (int40, int40) {
        return (count, count + 1);
    }

    function returnInt40(int40 count) external pure returns (int40) {
        return (count);
    }

    function returnUint48(uint48 count) external pure returns (uint48) {
        return count;
    }

    function returnInt48(int48 count) external pure returns (int48) {
        return count;
    }

    function returnUint56(uint56 count) external pure returns (uint56) {
        return count;
    }

    function returnInt56(int56 count) external pure returns (int56) {
        return count;
    }

    function returnUint64(uint64 count) external pure returns (uint64) {
        return count;
    }

    function returnInt64(int64 count) external pure returns (int64) {
        return count;
    }

    function returnUint72(uint72 count) external pure returns (uint72) {
        return count;
    }

    function returnInt72(int72 count) external pure returns (int72) {
        return count;
    }

    function returnUint80(uint80 count) external pure returns (uint80) {
        return count;
    }

    function returnInt80(int80 count) external pure returns (int80) {
        return count;
    }

    function returnUint88(uint88 count) external pure returns (uint88) {
        return count;
    }

    function returnInt88(int88 count) external pure returns (int88) {
        return count;
    }

    function returnUint96(uint96 count) external pure returns (uint96) {
        return count;
    }

    function returnInt96(int96 count) external pure returns (int96) {
        return count;
    }

    function returnUint104(uint104 count) external pure returns (uint104) {
        return count;
    }

    function returnInt104(int104 count) external pure returns (int104) {
        return count;
    }

    function returnUint112(uint112 count) external pure returns (uint112) {
        return count;
    }

    function returnInt112(int112 count) external pure returns (int112) {
        return count;
    }

    function returnUint120(uint120 count) external pure returns (uint120) {
        return count;
    }

    function returnInt120(int120 count) external pure returns (int120) {
        return count;
    }

    function returnUint128(uint128 count) external pure returns (uint128) {
        return count;
    }

    function returnInt128(int128 count) external pure returns (int128) {
        return count;
    }

    function returnUint136(uint136 count) external pure returns (uint136) {
        return count;
    }

    function returnInt136(int136 count) external pure returns (int136) {
        return count;
    }

    function returnUint144(uint144 count) external pure returns (uint144) {
        return count;
    }

    function returnInt144(int144 count) external pure returns (int144) {
        return count;
    }

    function returnUint152(uint152 count) external pure returns (uint152) {
        return count;
    }

    function returnInt152(int152 count) external pure returns (int152) {
        return count;
    }

    function returnUint160(uint160 count) external pure returns (uint160) {
        return count;
    }

    function returnInt160(int160 count) external pure returns (int160) {
        return count;
    }

    function returnUint168(uint168 count) external pure returns (uint168) {
        return count;
    }

    function returnInt168(int168 count) external pure returns (int168) {
        return count;
    }

    function returnUint176(uint176 count) external pure returns (uint176) {
        return count;
    }

    function returnInt176(int176 count) external pure returns (int176) {
        return count;
    }

    function returnUint184(uint184 count) external pure returns (uint184) {
        return count;
    }

    function returnInt184(int184 count) external pure returns (int184) {
        return count;
    }

    function returnUint192(uint192 count) external pure returns (uint192) {
        return count;
    }

    function returnInt192(int192 count) external pure returns (int192) {
        return count;
    }

    function returnUint200(uint200 count) external pure returns (uint200) {
        return count;
    }

    function returnInt200(int200 count) external pure returns (int200) {
        return count;
    }

    function returnUint208(uint208 count) external pure returns (uint208) {
        return count;
    }

    function returnInt208(int208 count) external pure returns (int208) {
        return count;
    }

    function returnUint216(uint216 count) external pure returns (uint216) {
        return count;
    }

    function returnInt216(int216 count) external pure returns (int216) {
        return count;
    }

    function returnUint224(uint224 count) external pure returns (uint224) {
        return count;
    }

    function returnInt224(int224 count) external pure returns (int224) {
        return count;
    }

    function returnUint232(uint232 count) external pure returns (uint232) {
        return count;
    }

    function returnInt232(int232 count) external pure returns (int232) {
        return count;
    }

    function returnUint240(uint240 count) external pure returns (uint240) {
        return count;
    }

    function returnInt240(int240 count) external pure returns (int240) {
        return count;
    }

    function returnUint248(uint248 count) external pure returns (uint248) {
        return count;
    }

    function returnInt248(int248 count) external pure returns (int248) {
        return count;
    }

    function returnUint256(uint256 count) external pure returns (uint256) {
        return count;
    }

    function returnInt256(int256 count) external pure returns (int256) {
        return count;
    }

    function returnMultipleInt256(
        int256 count
    ) external pure returns (int256, int256) {
        return (count, count + 1);
    }

    function returnInt8Array(int8[] memory arr) external pure returns (int8[] memory) {
        return arr;
    }

    function returnUint8Array(uint8[] memory arr) external pure returns (uint8[] memory) {
        return arr;
    }

    function returnInt16Array(int16[] memory arr) external pure returns (int16[] memory) {
        return arr;
    }

    function returnUint16Array(uint16[] memory arr) external pure returns (uint16[] memory) {
        return arr;
    }

    function returnInt24Array(int24[] memory arr) external pure returns (int24[] memory) {
        return arr;
    }

    function returnUint24Array(uint24[] memory arr) external pure returns (uint24[] memory) {
        return arr;
    }

    function returnInt32Array(int32[] memory arr) external pure returns (int32[] memory) {
        return arr;
    }

    function returnUint32Array(uint32[] memory arr) external pure returns (uint32[] memory) {
        return arr;
    }

    function returnInt40Array(int40[] memory arr) external pure returns (int40[] memory) {
        return arr;
    }

    function returnUint40Array(uint40[] memory arr) external pure returns (uint40[] memory) {
        return arr;
    }

    function returnInt48Array(int48[] memory arr) external pure returns (int48[] memory) {
        return arr;
    }

    function returnUint48Array(uint48[] memory arr) external pure returns (uint48[] memory) {
        return arr;
    }

    function returnInt56Array(int56[] memory arr) external pure returns (int56[] memory) {
        return arr;
    }

    function returnUint56Array(uint56[] memory arr) external pure returns (uint56[] memory) {
        return arr;
    }

    function returnInt64Array(int64[] memory arr) external pure returns (int64[] memory) {
        return arr;
    }

    function returnUint64Array(uint64[] memory arr) external pure returns (uint64[] memory) {
        return arr;
    }

    function returnInt72Array(int72[] memory arr) external pure returns (int72[] memory) {
        return arr;
    }

    function returnUint72Array(uint72[] memory arr) external pure returns (uint72[] memory) {
        return arr;
    }

    function returnInt80Array(int80[] memory arr) external pure returns (int80[] memory) {
        return arr;
    }

    function returnUint80Array(uint80[] memory arr) external pure returns (uint80[] memory) {
        return arr;
    }

    function returnInt88Array(int88[] memory arr) external pure returns (int88[] memory) {
        return arr;
    }

    function returnUint88Array(uint88[] memory arr) external pure returns (uint88[] memory) {
        return arr;
    }

    function returnInt96Array(int96[] memory arr) external pure returns (int96[] memory) {
        return arr;
    }

    function returnUint96Array(uint96[] memory arr) external pure returns (uint96[] memory) {
        return arr;
    }

    function returnInt104Array(int104[] memory arr) external pure returns (int104[] memory) {
        return arr;
    }

    function returnUint104Array(uint104[] memory arr) external pure returns (uint104[] memory) {
        return arr;
    }

    function returnInt112Array(int112[] memory arr) external pure returns (int112[] memory) {
        return arr;
    }

    function returnUint16Array(uint112[] memory arr) external pure returns (uint112[] memory) {
        return arr;
    }

    function returnInt120Array(int120[] memory arr) external pure returns (int120[] memory) {
        return arr;
    }

    function returnUint120Array(uint120[] memory arr) external pure returns (uint120[] memory) {
        return arr;
    }

    function returnInt128Array(int128[] memory arr) external pure returns (int128[] memory) {
        return arr;
    }

    function returnUint128Array(uint128[] memory arr) external pure returns (uint128[] memory) {
        return arr;
    }

    function returnInt136Array(int136[] memory arr) external pure returns (int136[] memory) {
        return arr;
    }

    function returnUint136Array(uint136[] memory arr) external pure returns (uint136[] memory) {
        return arr;
    }

    function returnInt144Array(int144[] memory arr) external pure returns (int144[] memory) {
        return arr;
    }

    function returnUint144Array(uint144[] memory arr) external pure returns (uint144[] memory) {
        return arr;
    }

    function returnInt152Array(int152[] memory arr) external pure returns (int152[] memory) {
        return arr;
    }

    function returnUint152Array(uint152[] memory arr) external pure returns (uint152[] memory) {
        return arr;
    }

    function returnInt160Array(int160[] memory arr) external pure returns (int160[] memory) {
        return arr;
    }

    function returnUint160Array(uint160[] memory arr) external pure returns (uint160[] memory) {
        return arr;
    }

    function returnInt168Array(int168[] memory arr) external pure returns (int168[] memory) {
        return arr;
    }

    function returnUint168Array(uint168[] memory arr) external pure returns (uint168[] memory) {
        return arr;
    }

    function returnInt176Array(int176[] memory arr) external pure returns (int176[] memory) {
        return arr;
    }

    function returnUint176Array(uint176[] memory arr) external pure returns (uint176[] memory) {
        return arr;
    }

    function returnInt184Array(int184[] memory arr) external pure returns (int184[] memory) {
        return arr;
    }

    function returnUint184Array(uint184[] memory arr) external pure returns (uint184[] memory) {
        return arr;
    }

    function returnInt192Array(int192[] memory arr) external pure returns (int192[] memory) {
        return arr;
    }

    function returnUint192Array(uint192[] memory arr) external pure returns (uint192[] memory) {
        return arr;
    }

    function returnInt200Array(int200[] memory arr) external pure returns (int200[] memory) {
        return arr;
    }

    function returnUint200Array(uint200[] memory arr) external pure returns (uint200[] memory) {
        return arr;
    }

    function returnInt208Array(int208[] memory arr) external pure returns (int208[] memory) {
        return arr;
    }

    function returnUint208Array(uint208[] memory arr) external pure returns (uint208[] memory) {
        return arr;
    }

    function returnInt216Array(int216[] memory arr) external pure returns (int216[] memory) {
        return arr;
    }

    function returnUint216Array(uint216[] memory arr) external pure returns (uint216[] memory) {
        return arr;
    }

    function returnInt224Array(int224[] memory arr) external pure returns (int224[] memory) {
        return arr;
    }

    function returnUint224Array(uint224[] memory arr) external pure returns (uint224[] memory) {
        return arr;
    }

    function returnInt232Array(int232[] memory arr) external pure returns (int232[] memory) {
        return arr;
    }

    function returnUint232Array(uint232[] memory arr) external pure returns (uint232[] memory) {
        return arr;
    }

    function returnInt240Array(int240[] memory arr) external pure returns (int240[] memory) {
        return arr;
    }

    function returnUint240Array(uint240[] memory arr) external pure returns (uint240[] memory) {
        return arr;
    }

    function returnInt248Array(int248[] memory arr) external pure returns (int248[] memory) {
        return arr;
    }

    function returnUint248Array(uint248[] memory arr) external pure returns (uint248[] memory) {
        return arr;
    }

    function returnInt256Array(int256[] memory arr) external pure returns (int256[] memory) {
        return arr;
    }

    function returnUint256Array(uint256[] memory arr) external pure returns (uint256[] memory) {
        return arr;
    }
}
