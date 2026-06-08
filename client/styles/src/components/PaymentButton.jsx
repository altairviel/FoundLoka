import { useState } from 'react';
import axios from 'axios'; // ➕ Diperlukan untuk menembak rute demo-success
import { createInvestmentPayment, createInstallmentPayment } from '../services/payment';

/**
 * Komponen tombol pembayaran Midtrans — bisa dipakai untuk:
 * - Investor membayar investasi (type="investment")
 * - Owner membayar cicilan   (type="installment")
 */
export default function PaymentButton({
  type, // 'investment' | 'installment'
  campaignId, // untuk type='investment'
  amount, // untuk type='investment'
  installmentId, // untuk type='installment'
  onSuccess, // callback setelah berhasil bayar (memicu fetchDetail di parent)
  onError, // callback kalau gagal
  label = 'Bayar Sekarang',
  style = {},
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 1. Minta snap_token dari backend
      let snapToken;
      let orderId;

      if (type === 'investment') {
        const { data } = await createInvestmentPayment(campaignId, amount);
        snapToken = data.snap_token;
        orderId = data.order_id || data.id; // sesuaikan key ID transaksi dari payload backend-mu
      } else {
        const { data } = await createInstallmentPayment(installmentId);
        snapToken = data.snap_token;
        orderId = data.order_id || data.id;
      }

      // 2. Buka popup Midtrans Snap
      window.snap.pay(snapToken, {
        onSuccess: async (result) => {
          setMessage('✅ Pembayaran berhasil diproses!');

          try {
            // Ambil token auth JWT dari localStorage untuk melewati middleware 'protect' backend
            const token = localStorage.getItem('token');

            // 💡 Paksa backend lokal memperbarui database secara instan
            await axios.post('https://contact-mumble-unfunded.ngrok-free.dev/api/payments/demo-success', { order_id: result.order_id || orderId }, { headers: { Authorization: `Bearer ${token}` } });

            // Jalankan fungsi fetchDetail() bawaan dari CampaignDetail.jsx
            if (onSuccess) onSuccess(result);

            // Berikan efek refresh halaman otomatis agar seluruh state dashboard & detail ter-render ulang
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (demoErr) {
            console.error('Gagal melakukan bypass sinkronisasi database demo:', demoErr);
            // Tetap jalankan callback utama sebagai fallback keselamatan
            if (onSuccess) onSuccess(result);
          }
        },
        onPending: (result) => {
          setMessage('⏳ Pembayaran pending — silakan selesaikan transfer kamu');
          if (onSuccess) onSuccess(result);
        },
        onError: (result) => {
          setMessage('❌ Pembayaran gagal, coba lagi');
          if (onError) onError(result);
        },
        onClose: () => {
          setMessage('Pembayaran dibatalkan oleh pengguna');
        },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Terjadi kesalahan, coba lagi';
      setMessage(`❌ ${msg}`);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          padding: '10px 24px',
          background: loading ? '#9ca3af' : '#16a34a',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
          ...style,
        }}
      >
        {loading ? 'Memproses...' : label}
      </button>

      {/* Tampilan Status Pesan */}
      {message && (
        <p
          style={{
            marginTop: 8,
            fontSize: 13,
            color: message.startsWith('✅') ? '#16a34a' : message.startsWith('⏳') ? '#d97706' : '#dc2626',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
