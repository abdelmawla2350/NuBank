"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation';
import { exchangePublicToken } from '@/lib/actions/user.actions';
import Image from 'next/image';

const PlaidLink = ({ user, variant, accessToken }: PlaidLinkProps) => {
  const router = useRouter();

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLinkToken = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/plaid/link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.$id || user?.userId, accessToken }),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error('createLinkToken API error', data);
          setToken('');
          setError(data?.error || 'Failed to create link token');
          setLoading(false);
          return;
        }

        if (!data?.linkToken) {
          console.warn('createLinkToken API returned no token', data);
          setToken('');
          setError('No link token returned');
          setLoading(false);
          return;
        }

        console.log('Link token received');
        setToken(data.linkToken);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching link token:', err);
        setToken('');
        setError(String(err));
        setLoading(false);
      }
    }

    getLinkToken();
  }, [user]);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) => {
    await exchangePublicToken({
      publicToken: public_token,
      user,
    })

    router.push('/');
  }, [user])
  
  const config: PlaidLinkOptions = {
    token,
    onSuccess
  }

  const { open, ready } = usePlaidLink(config);
  
  const isReady = ready && !!token;

  useEffect(() => {
    console.log('PlaidLink state:', { ready, token, isReady, loading, error });
  }, [ready, token, isReady, loading, error]);

  return (
    <>
      {error && (
        <div className="text-red-600 mb-2">
          <p>Could not create Plaid link token: {error}</p>
          <Button onClick={() => {
            setToken('');
            setError(null);
            setLoading(true);
            // trigger effect by updating token to empty; effect runs on user change only,
            // so do a simple refetch by calling the endpoint directly here
            (async () => {
              try {
                const res = await fetch('/api/plaid/link-token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user?.$id || user?.userId, accessToken }),
                });
                const data = await res.json();
                if (res.ok && data?.linkToken) {
                  setToken(data.linkToken);
                } else {
                  setError(data?.error || 'Retry failed');
                }
              } catch (err) {
                setError(String(err));
              } finally {
                setLoading(false);
              }
            })();
          }}>
            Retry
          </Button>
        </div>
      )}

      {variant === 'primary' ? (
        <Button
          onClick={() => isReady && open?.()}
          disabled={!isReady}
          className="plaidlink-primary"
        >
          {loading ? 'Loading…' : 'Connect bank'}
        </Button>
      ): variant === 'ghost' ? (
        <Button onClick={() => isReady && open?.()} variant="ghost" className="plaidlink-ghost" disabled={!isReady}>
          <Image 
            src="/icons/connect-bank.svg"
            alt="connect bank"
            width={24}
            height={24}
          />
          <p className='hiddenl text-[16px] font-semibold text-black-2 xl:block'>{loading ? 'Loading…' : 'Connect bank'}</p>
        </Button>
      ): (
        <Button onClick={() => isReady && open?.()} className="plaidlink-default" disabled={!isReady}>
          <Image 
            src="/icons/connect-bank.svg"
            alt="connect bank"
            width={24}
            height={24}
          />
          <p className='text-[16px] font-semibold text-black-2'>{loading ? 'Loading…' : 'Connect bank'}</p>
        </Button>
      )}
    </>
  )
}

export default PlaidLink