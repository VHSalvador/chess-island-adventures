import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/');
      } else {
        await signUp(email, password, displayName);
        toast.success('Sikeres regisztráció! Most már beléphetsz.');
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-island-sky to-island-water flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-2xl p-8 border-4 border-accent">
          {/* Header with characters */}
          <div className="flex justify-center gap-2 mb-4">
            {['bence', 'erno', 'szonja'].map((c) => (
              <motion.div key={c} animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}>
                <CharacterSVG characterId={c} size={40} />
              </motion.div>
            ))}
          </div>

          <h1 className="text-3xl font-display text-center text-foreground mb-2">
            🏝️ Sakk-Sziget Hősei
          </h1>
          <p className="text-center text-muted-foreground mb-6 font-body">
            {isLogin ? 'Szülői bejelentkezés' : 'Új fiók létrehozása'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-foreground">Név</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="A neved"
                  className="mt-1 rounded-xl text-lg h-12"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@pelda.hu"
                className="mt-1 rounded-xl text-lg h-12"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Jelszó</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 rounded-xl text-lg h-12"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full child-button bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? '⏳ Várj...' : isLogin ? '🔑 Belépés' : '✨ Regisztráció'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-secondary hover:underline font-medium"
            >
              {isLogin ? 'Nincs még fiókod? Regisztrálj!' : 'Van már fiókod? Lépj be!'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
