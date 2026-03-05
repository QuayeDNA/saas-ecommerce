import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { PageLoader } from '../components/page-loader';
import { Button, Card, CardBody } from '../design-system';
import { storefrontService } from '../services/storefront.service';

type VerifyStatus = 'idle' | 'verifying' | 'success' | 'failed';

export const StorefrontCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || undefined;
  const navigate = useNavigate();
  const { storefrontId } = useParams();
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
        const resp = await storefrontService.verifyPaystackReference(reference);
        if (resp?.success) {
          setStatus('success');
          setMessage('Payment verified and order updated.');

          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(
                { type: 'PAYSTACK_STOREFRONT', status: 'success', reference, storefrontId },
                window.location.origin
              );
            } catch (postErr) {
              console.debug('Failed to postMessage to opener:', postErr);
            }

            setTimeout(() => {
              try { window.close(); } catch { /* ignore */ }
            }, 600);
          }
        } else {
          setStatus('failed');
          setMessage(resp?.message || 'Verification failed. Webhook will reconcile shortly.');

          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(
                { type: 'PAYSTACK_STOREFRONT', status: 'failed', reference, message: resp?.message || null },
                window.location.origin
              );
            } catch (postErr) {
              console.debug('Failed to postMessage to opener:', postErr);
            }

            setTimeout(() => {
              try { window.close(); } catch { /* ignore */ }
            }, 600);
          }
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setStatus('failed');
        setMessage(errMsg || 'Verification error.');

        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage(
              { type: 'PAYSTACK_STOREFRONT', status: 'failed', reference, message: errMsg },
              window.location.origin
            );
          } catch (postErr) {
            console.debug('Failed to postMessage to opener:', postErr);
          }

          setTimeout(() => {
            try { window.close(); } catch { /* ignore */ }
          }, 600);
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
                <Button onClick={() => (window.opener && !window.opener.closed) ? window.close() : navigate(`/store/${storefrontId}`)}>
                  {window.opener && !window.opener.closed ? 'Close' : 'Back to Store'}
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <h2 className="text-2xl font-semibold text-red-600">Verification pending</h2>
              <p className="mt-2 text-gray-600">{message}</p>
              <div className="mt-6">
                <Button onClick={() => (window.opener && !window.opener.closed) ? window.close() : navigate(`/store/${storefrontId}`)}>
                  {window.opener && !window.opener.closed ? 'Close' : 'Back to Store'}
                </Button>
              </div>
            </>
          )}

          {!reference && (
            <div className="mt-6 text-sm text-gray-500">If you completed payment but this page shows an error, the webhook will eventually update the order status.</div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default StorefrontCallbackPage;