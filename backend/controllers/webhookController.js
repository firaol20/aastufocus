import prisma from '../utils/prisma.js';
import chapaService from '../services/chapaService.js';
import crypto from 'crypto';

export const handleChapaWebhook = async (req, res) => {
  try {
    const { tx_ref, status, transaction_id } = req.body;

    console.log('Received webhook:', { tx_ref, status, transaction_id });

    // Verify webhook signature if provided
    const signature = req.headers['chapa-signature'];
    if (signature && !verifyWebhookSignature(req.body, signature)) {
      console.error('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    // Find donation by tx_ref (which is the donation ID)
    const donation = await prisma.donation.findUnique({ where: { id: tx_ref } });
    if (!donation) {
      console.error('Donation not found:', tx_ref);
      return res.status(404).send('Donation not found');
    }

    try {
      const verification = await chapaService.verifyPayment(transaction_id);

      if (verification.data.status === 'success') {
        await prisma.donation.update({
          where: { id: tx_ref },
          data: {
            paymentStatus: 'completed',
            transactionId: transaction_id
          }
        });
        console.log(`Payment completed for donation ${tx_ref}`);
      } else {
        await prisma.donation.update({
          where: { id: tx_ref },
          data: { paymentStatus: 'failed' }
        });
        console.log(`Payment failed for donation ${tx_ref}`);
      }
    } catch (verificationError) {
      console.error('Payment verification failed:', verificationError);
      await prisma.donation.update({
        where: { id: tx_ref },
        data: { paymentStatus: 'failed' }
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Webhook processing failed');
  }
};

function verifyWebhookSignature(payload, signature) {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export const testWebhook = async (req, res) => {
  try {
    const { donationId } = req.params;

    const donation = await prisma.donation.findUnique({ where: { id: donationId } });
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    const webhookPayload = {
      tx_ref: donation.id,
      status: 'success',
      transaction_id: 'test_transaction_123',
      amount: donation.amount.toString(),
      currency: donation.currency
    };

    await handleChapaWebhook({ body: webhookPayload, headers: {} }, res);
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ success: false, message: 'Test webhook failed' });
  }
};