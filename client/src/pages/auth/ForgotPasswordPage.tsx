// src/pages/auth/ForgotPasswordPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { forgotPassword } from '@/services/authService';

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await forgotPassword(data.email);
      if (response.success) {
        setSuccess('Password reset instructions have been sent to your email.');
        form.reset();
      } else {
        setError('Failed to send password reset instructions. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Forgot Your Password?</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address below and we'll send you instructions to reset your password.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="yourname@example.com"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/90">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
