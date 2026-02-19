import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {PageLoader} from '../components/page-loader';
import { Button } from '../design-system';
import { walletService } from '../services/wallet-service';

export const WalletTopupCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || undefined;
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setMessage('No transaction reference provided.');
      return;
    }

    (async () => {
      setStatus('verifying');
      try {
        const resp = await walletService.verifyPaystackReference(reference);
        if (resp?.success) {
          setStatus('success');
          setMessage('Payment verified and wallet updated.');
        } else {
          setStatus('failed');
          setMessage(resp?.message || 'Verification failed. Webhook will update status shortly.');
        }
      } catch (err: any) {
        setStatus('failed');
        setMessage(err?.message || 'Verification error.');
      }
    })();
  }, [reference]);

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      {status === 'verifying' && (
        <div>
          <PageLoader />
          <p className="mt-4">Verifying payment, please wait...</p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <h2 className="text-2xl font-semibold text-green-600">Payment successful</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          <div className="mt-6">
            <Button onClick={() => navigate('/agent/dashboard/wallet')}>Go to Wallet</Button>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div>
          <h2 className="text-2xl font-semibold text-red-600">Verification pending</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          <div className="mt-6">
            <Button onClick={() => navigate('/agent/dashboard/wallet')}>Back to Wallet</Button>
          </div>
        </div>
      )}

      {!reference && (
        <div className="mt-6 text-sm text-gray-500">If you completed payment but this page shows an error, the webhook will eventually update your wallet.</div>
      )}
    </div>
  );
};

export default WalletTopupCallbackPage;