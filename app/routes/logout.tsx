import { redirect, type ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return redirect('/');
  }

  // Clear the authentication cookie
  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    'token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
  );

  // Redirect to home page
  return redirect('/', { headers });
}

// If someone tries to access logout via GET, redirect to home
export async function loader() {
  return redirect('/');
}
