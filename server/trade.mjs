export const SEED_CASH = 1_000_000;

const SHORT_MARGIN = 0.5;

export const MAX_QTY = 1_000_000;

export class TradeError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function applyFill({ cash, qty, avgPrice }, side, orderQty, fillPrice) {
  const notional = Math.round(fillPrice * orderQty);
  const nextQty = side === 'buy' ? qty + orderQty : qty - orderQty;
  const nextCash = side === 'buy' ? cash - notional : cash + notional;

  if (nextCash < 0) {
    throw new TradeError('TRADE_001', '현금이 부족합니다.');
  }

  if (nextQty < 0) {
    const required = Math.round(-nextQty * fillPrice * (1 + SHORT_MARGIN));
    if (nextCash < required) {
      throw new TradeError(
        'TRADE_002',
        `공매도 증거금이 부족합니다. ${required.toLocaleString('ko-KR')}원이 필요합니다.`,
      );
    }
  }

  let nextAvg;
  if (nextQty === 0) {
    nextAvg = 0;
  } else if (qty === 0 || Math.sign(nextQty) !== Math.sign(qty)) {
    nextAvg = fillPrice;
  } else if (Math.abs(nextQty) > Math.abs(qty)) {
    nextAvg =
      (avgPrice * Math.abs(qty) + fillPrice * orderQty) / Math.abs(nextQty);
  } else {
    nextAvg = avgPrice;
  }

  return { cash: nextCash, qty: nextQty, avgPrice: nextAvg, notional };
}

export function equityOf(cash, positions, priceOf) {
  let value = cash;
  for (const p of positions) value += p.qty * (priceOf(p.code) ?? p.avgPrice);
  return Math.round(value);
}
