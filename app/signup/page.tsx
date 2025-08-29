import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignUpForm } from '@/components/auth/signup-form';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Student Account</CardTitle>
          <CardDescription className="text-center">
            Fill in your details to create a new student account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
