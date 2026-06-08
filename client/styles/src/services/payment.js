import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/payments';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Pastikan key 'token' sesuai dengan penyimpananmu
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Meminta Snap Token untuk Investasi
 */
export const createInvestmentPayment = async (campaignId, amount) => {
  try {
    const payload = {
      campaign_id: campaignId,
      amount: amount,
    };

    // 💡 DIKUNCI KE /invest AGAR SINKRON DENGAN BACKEND
    const response = await axios.post(`${API_BASE_URL}/invest`, payload, getAuthHeaders());
    return response;
  } catch (error) {
    console.error('PaymentService Investment Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Meminta Snap Token untuk Cicilan
 */
export const createInstallmentPayment = async (installmentId) => {
  try {
    const payload = {
      installment_id: installmentId,
    };

    // 💡 DIKUNCI KE /installment AGAR SINKRON DENGAN BACKEND
    const response = await axios.post(`${API_BASE_URL}/installment`, payload, getAuthHeaders());
    return response;
  } catch (error) {
    console.error('PaymentService Installment Error:', error.response?.data || error.message);
    throw error;
  }
};
