import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation';
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions';
import Image from 'next/image';

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
  const router = useRouter();
  const [token, setToken] = useState('');

  useEffect(() => {
    if (!user) return; // Prevent API call if user is not loaded yet

    const getLinkToken = async () => {
      try {
        const data = await createLinkToken(user);
        setToken(data?.linkToken || '');
      } catch (err) {
        console.error("Error creating link token:", err);
      }
    };

    getLinkToken();
  }, [user]);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) => {
    try {
      await exchangePublicToken({ publicToken: public_token, user });
      router.push('/');
    } catch (err) {
      console.error("Error exchanging token:", err);
    }
  }, [user, router]);

  if (!token) return null; 

  const config: PlaidLinkOptions = { token, onSuccess };
  const { open, ready } = usePlaidLink(config);

  return (
    <>
      {variant === 'primary' ? (
        <Button onClick={() => open()} disabled={!ready} className="plaidlink-primary">
          Connect bank
        </Button>
      ) : variant === 'ghost' ? (
        <Button onClick={() => open()} variant="ghost" className="plaidlink-ghost">
          <Image src="/icons/connect-bank.svg" alt="connect bank" width={24} height={24} />
          <p className='hidden xl:block text-[16px] font-semibold text-black-2'>Connect bank</p>
        </Button>
      ) : (
        <Button onClick={() => open()} className="plaidlink-default">
          <Image src="/icons/connect-bank.svg" alt="connect bank" width={24} height={24} />
          <p className='text-[16px] font-semibold text-black-2'>Connect bank</p>
        </Button>
      )}
    </>
  );
};

export default PlaidLink;
