'use client';

import PhoneAuth from './phone-auth';
import { Toaster } from '../ui/toaster';

export default function RegisterForm() {
  return (
    <>
      <PhoneAuth />
      <Toaster />
    </>
  );
}