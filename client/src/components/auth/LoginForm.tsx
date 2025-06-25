import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await onLogin(email, password);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      if (response.ok) {
        setForgotMessage('Se o email existir, você receberá instruções de recuperação.');
      }
    } catch (error) {
      setForgotMessage('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Recuperar Senha</h2>
            <p className="mt-2 text-sm text-gray-600">
              Digite seu email para receber instruções de recuperação
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    required
                  />
                </div>

                {forgotMessage && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{forgotMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    Enviar Instruções
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Voltar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Música Litúrgica</h2>
          <p className="mt-2 text-sm text-gray-600">
            Paróquia Boa Viagem - Itabirito
          </p>
          <p className="mt-4 text-lg text-gray-700">
            Entre em sua conta
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-slate-900 hover:bg-slate-800"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}