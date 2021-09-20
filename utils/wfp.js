const config = require('config');
const axios = require('axios');
const mongoose = require('mongoose');

const express = require("express");
const crypto = require('crypto');

const {
    Transaction,
    STATUS_TR,
    validateTransaction
} = require('../models/transaction');

const {
    Order, 
    validateOrder,
    getOrderStatusText,
    ORDER_STATUS_CART,
    ORDER_STATUS_NEW,
    ORDER_STATUS_PROCESSED,
    ORDER_STATUS_IN_WORK,
    ORDER_STATUS_WAIT_PROCESSING,
    ORDER_STATUS_CANCELLED,
    ORDER_STATUS_PATTERN,
    STATUS_TEXT,
    getProductIdx,
    prepareData,
    getUserCart,
    calcSum
} = require('../models/order');


const WFP_CODE_OK = 1100;
const WFP_CODE_BANK_Declined_To_Card = 1101;
const WFP_CODE_BANK_Insufficient_Funds = 1104;
const WFP_CODE_Transaction_is_pending = 1134;
const WFP_CODE_Transaction_in_processing = 1131;

function wfpcodetoorderstatuspaycode(code) {
    console.log("wfpcodetoorderstatuspaycode", code);
    if (code == WFP_CODE_Transaction_is_pending) {
        return STATUS_TR.PENDING
    }
    if (code == WFP_CODE_OK) {
        return STATUS_TR.PAID
    }
    if (code == WFP_CODE_Transaction_in_processing) {
        return STATUS_TR.PROCESSING
    }
    if (code == WFP_CODE_BANK_Declined_To_Card || code == WFP_CODE_BANK_Insufficient_Funds) {
        return STATUS_TR.DECLINED_PAYMENT
    }

}
async function handlerAnswerforWFP(parsed2) {
    console.log("handlerAnswerforWFP", parsed2);
    let codePayWFP = wfpcodetoorderstatuspaycode(parsed2.reasonCode);
    let transaction = await Transaction.findOneAndUpdate({ "wfp_id": parsed2.orderReference }, {
        $set: {
            status: codePayWFP,
            dateLastUpdate: Date.now()
        }

    }, { new: true });
    console.log("transaction", transaction);
    return transaction
}

module.exports = {
    wfpcodetoorderstatuspaycode: wfpcodetoorderstatuspaycode,
    handlerAnswerforWFP: handlerAnswerforWFP,
}