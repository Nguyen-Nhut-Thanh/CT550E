# VNPay sandbox payments

The API reads the sandbox merchant code and hash secret from the ignored root `.env` file. The secret stays on the server. `.env.example` contains empty credential placeholders.

## Setup

1. Set `VNP_TMN_CODE`, `VNP_HASH_SECRET`, `VNP_PAYMENT_URL`, `VNP_RETURN_URL`, and `VNP_EXPIRE_MINUTES`. The payment endpoint defaults to `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` and the session lasts 15 minutes.
2. Run `npm run db:vnpay`, `npm run db:generate`, and rebuild shared/API. The additive, repeatable migration preserves all existing payment rows.
3. Restart the API after changing `.env`.
4. Register the public HTTPS IPN URL with the sandbox merchant: `https://nhutthanh.id.vn/api/payment/vnpay-ipn`. The registered website domain proxies `/api/*` to this checkout's running API. `VNP_RETURN_URL` is `https://nhutthanh.id.vn/api/payment/vnpay-return`; `FRONTEND_PUBLIC_URL` controls the result-page destination.

For local browser testing, the return URL and frontend origin must reach the same test installation. VNPay's IPN servers cannot call a localhost address; use the configured public HTTPS API or a tunnel and register that IPN URL with VNPay. A verified successful return also settles the booking, so a delayed IPN does not leave it pending. IPN still confirms payments when the customer closes the browser before returning.

## Flow

- The authenticated `POST /payment/create-url` accepts only a booking ID. Ownership, payable state, departure, and amount come from the database. An active attempt is reused on double clicks.
- Amounts are converted to VNPay minor units exactly. Creation/expiry timestamps always use Vietnam time, regardless of server timezone.
- Attempts record a unique provider reference, expiry, response code, bank transaction status, bank transaction number, and payment date.
- Both callbacks verify HMAC-SHA512, merchant code, scalar callback parameters, the stored reference, and the stored amount.
- Both `GET /payment/vnpay-ipn` and `GET /payment/vnpay-return` use the same verified settlement path. They can mark a booking paid only when both VNPay response and transaction status are `00`, the issued reference and amount match, and the HMAC-SHA512 signature is valid. Booking-row locks serialize callbacks. Duplicate notifications do not duplicate payment records or confirmation emails.
- A verified cancellation/failure closes its attempt so the customer can retry without creating another booking. Payment failure leaves the booking pending. An arbitrary `status=success` frontend query is never accepted as proof of payment.
- A late successful payment for a cancelled/already-paid booking is recorded as `review` for manual reconciliation. It never reopens the booking or reserves seats again. Refunds are not initiated automatically.
- VNPay suspected-debit (`07`) and bank-reversal (`04`) results also require reconciliation. Payment creation is blocked while a pending booking has a transaction under review.
- The result page reads the authenticated `/payment/status?reference=...` endpoint, polls briefly for delayed IPN, and offers manual refresh. A forged `status=success` query does not establish success.
- Customers can resume payment from booking details. Failed/cancelled/expired attempts offer a retry on the result page when the booking is still pending.

`npm run test:vnpay` tests signing, tampering, ownership, amounts, date handling, delayed IPN, retries, duplicate/concurrent callbacks, and cancelled-booking reconciliation without charging a card or sending email. `npm run test:vnpay:integration` also tests PostgreSQL with disposable, rolled-back fixtures, opens a signed sandbox checkout request to verify the configured credentials, and checks public callback/authentication routes. It never submits a card payment.

Official protocol: [VNPay payment integration](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html).
