import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLoader } from '../components/page-loader';
import { Button, Card, CardBody } from '../design-system';
import { walletService } from '../services/wallet-service';

type VerifyStatus = 'idle' | 'verifying' | 'success' | 'failed';

export const WalletTopupCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || undefined;
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerifyStatus>('idle');
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

          // Notify opener (the original tab) and close popup when possible
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(
                { type: 'PAYSTACK_TOPUP', status: 'success', reference },
                window.location.origin
              );
            } catch (postErr) {
              console.debug('Failed to postMessage to opener:', postErr);
            }

            // give opener a moment to receive the message then self-close
            setTimeout(() => {
              try {
                window.close();
              } catch (closeErr) {
                console.debug('Failed to close popup:', closeErr);
              }
            }, 500);
          }
        } else {
          setStatus('failed');
          setMessage(resp?.message || 'Verification failed. Webhook will update status shortly.');

          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(
                { type: 'PAYSTACK_TOPUP', status: 'failed', reference, message: resp?.message || null },
                window.location.origin
              );
            } catch (postErr) {
              console.debug('Failed to postMessage to opener:', postErr);
            }

            setTimeout(() => {
              try {
                window.close();
              } catch (closeErr) {
                console.debug('Failed to close popup:', closeErr);
              }
            }, 500);
          }
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setStatus('failed');
        setMessage(errMsg || 'Verification error.');

        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(
              { type: 'PAYSTACK_TOPUP', status: 'failed', reference, message: errMsg },
              window.location.origin
            );
          } catch (postErr) {
            console.debug('Failed to postMessage to opener:', postErr);
          }

          setTimeout(() => {
            try {
              window.close();
            } catch (closeErr) {
              console.debug('Failed to close popup:', closeErr);
            }
          }, 500);
        }
      }
    })();
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardBody className="text-center p-8">
          {status === 'verifying' && (
            <>
              <PageLoader />
              <p className="mt-4">Verifying payment, please wait...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h2 className="text-2xl font-semibold text-green-600">Payment successful</h2>
              <p className="mt-2 text-gray-600">{message}</p>
              <div className="mt-6">
                {/* If this tab was opened as a popup the opener should have handled navigation; otherwise navigate here */}
                <Button onClick={() => (window.opener && !window.opener.closed) ? window.close() : navigate('/agent/dashboard/wallet')}>
                  {window.opener && !window.opener.closed ? 'Close' : 'Go to Wallet'}
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <h2 className="text-2xl font-semibold text-red-600">Verification pending</h2>
              <p className="mt-2 text-gray-600">{message}</p>
              <div className="mt-6">
                <Button onClick={() => (window.opener && !window.opener.closed) ? window.close() : navigate('/agent/dashboard/wallet')}>
                  {window.opener && !window.opener.closed ? 'Close' : 'Back to Wallet'}
                </Button>
              </div>
            </>
          )}

          {!reference && (
            <div className="mt-6 text-sm text-gray-500">If you completed payment but this page shows an error, the webhook will eventually update your wallet.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default WalletTopupCallbackPage;