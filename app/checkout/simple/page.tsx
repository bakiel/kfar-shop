import { redirect } from 'next/navigation';

export default function SimpleCheckoutRedirect() {
  redirect('/checkout');
}
