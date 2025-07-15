'use client';

import PhoneAuth from './phone-auth';
import { Toaster } from '../ui/toaster';

export default function LoginForm() {
  return (
    <>
      <PhoneAuth />
      <Toaster />
    </>
  );
}