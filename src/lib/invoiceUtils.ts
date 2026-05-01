import { useToast } from '../hooks/useToast';

/**
 * Exports a professional accounting invoice PDF from the backend.
 */
export const exportInvoicePDF = async (orderId: string) => {
  try {
    const token = sessionStorage.getItem('ec_access_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const response = await fetch(`${baseUrl}/api/v1/orders/export/${orderId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Export failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderId.substring(0, 8).toUpperCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('PDF Export Error:', error);
    useToast.getState().add({ type: 'error', message: 'Không thể xuất hóa đơn PDF. Vui lòng thử lại sau.' });
  }
};
