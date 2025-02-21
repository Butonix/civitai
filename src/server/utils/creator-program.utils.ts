import dayjs from 'dayjs';
import {
  EXTRACTION_FEES,
  EXTRACTION_PHASE_DURATION,
  PayoutMethods,
  WITHDRAWAL_FEES,
} from '~/shared/constants/creator-program.constants';

export function getForecastedValue(
  toBank: number,
  pool: { size: { forecasted: number }; value: number }
) {
  return (toBank / pool.size.forecasted) * pool.value;
}

export function getCurrentValue(
  toBank: number,
  pool: { size: { forecasted: number }; value: number }
) {
  if (pool.value === 0) return 0;

  return (toBank / pool.value) * pool.value;
}

export function getExtractionFee(toExtract: number): number {
  let fee = 0;
  let remaining = toExtract;

  for (const { min, max, fee: rate } of EXTRACTION_FEES) {
    if (remaining <= 0) break;

    const taxableAmount = Math.min(remaining, max - min);
    fee += taxableAmount * rate;
    remaining -= taxableAmount;
  }

  return fee;
}

export function getPhases(month?: Date) {
  month ??= new Date();
  const dayjsMonth = dayjs(month);

  const bank = [
    dayjsMonth.startOf('month').toDate(),
    dayjsMonth.endOf('month').subtract(EXTRACTION_PHASE_DURATION, 'days').toDate(),
  ];
  const extraction = [bank[1], dayjsMonth.endOf('month').subtract(1, 'hours').toDate()];

  return { bank, extraction };
}

export function getWithdrawalFee(amount: number, method: PayoutMethods) {
  const { type, amount: fee } = WITHDRAWAL_FEES[method];
  return type === 'percent' ? amount * fee : fee;
}

export function getWithdrawalRequestId(id: string, userId: number) {
  return `CW:${userId}:${id}`.slice(0, 16); // Tipalti only supports 16 characters.....
}

/**
 * Parses a Tipalti withdrawal request ID to the user ID and the ID part of the cash withdrawal ID.
 * Always use these 2 to identify a cash withdrawal.
 *
 * @param requestId Tipalti withdrawal request ID
 * @returns  The user ID and the ID part of the cash withdrawal ID.
 */
export function parseRequestIdToWithdrawalId(requestId: string) {
  const [, userId, idPart] = requestId.split(':');
  return {
    userId: Number(userId),
    idPart,
  };
}
