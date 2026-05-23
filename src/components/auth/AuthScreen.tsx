import { useState } from 'react';
import { useStore } from '../../store';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = useStore((s) => s.signIn);
  const signUp = useStore((s) => s.signUp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Preencha e-mail e senha.'); return; }
    setLoading(true);
    const err = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="home-wrap">
      <div className="home-card">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 36, color: 'var(--gold)', marginBottom: 4 }}>SheetSync</h1>
          <p style={{ color: 'var(--text2)' }}>Fichas de Tormenta 20 em Tempo Real</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            className={mode === 'login' ? 'btn btn-gold' : 'btn btn-secondary'}
            style={{ flex: 1 }}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Entrar
          </button>
          <button
            className={mode === 'signup' ? 'btn btn-gold' : 'btn btn-secondary'}
            style={{ flex: 1 }}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-row">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>
          <div className="form-row">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Mínimo 6 caracteres"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
          <button
            type="submit"
            className="btn btn-gold w-full"
            style={{ padding: '12px 20px', fontSize: 15 }}
            disabled={loading}
          >
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
