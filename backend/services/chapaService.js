import axios from 'axios';

class ChapaService {
  constructor() {
    this.baseURL = process.env.CHAPA_BASE_URL;
    this.secretKey = process.env.CHAPA_SECRET_KEY;
  }

  async initializePayment(donation) {
    try {
      const payload = {
        amount: donation.amount.toString(),
        currency: donation.currency,
        email: donation.donor.email,
        first_name: donation.donor.name.split(' ')[0],
        last_name: donation.donor.name.split(' ').slice(1).join(' ') || '',
        tx_ref: donation._id.toString(),
        callback_url: `${process.env.BASE_URL}/api/webhooks/chapa`,
        return_url: `${process.env.BASE_URL}/api/donations/success/${donation._id}`,
        customizations: {
          title: "Donation Payment",
          description: `Donation for ${donation.purpose}`,
          logo: "https://aastufocus.com/logo.png"
        }
      };

      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        checkoutUrl: response.data.data.checkout_url,
        transactionRef: response.data.data.tx_ref
      };

    } catch (error) {
      console.error('Chapa payment initialization failed:', error.response?.data || error.message);
      throw new Error('Payment initialization failed');
    }
  }

  async verifyPayment(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data.data
      };

    } catch (error) {
      console.error('Chapa payment verification failed:', error.response?.data || error.message);
      throw new Error('Payment verification failed');
    }
  }

  async getBalance() {
    try {
      const response = await axios.get(
        `${this.baseURL}/account/balance`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }
}

export default new ChapaService();