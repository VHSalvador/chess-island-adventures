import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import { toast } from 'sonner';

const STARS = [
  { top: '8%',  left: '12%', size: 3, delay: 0 },
  { top: '15%', left: '80%', size: 2, delay: 0.4 },
  { top: '25%', left: '55%', size: 4, delay: 0.8 },
  { top: '5%',  left: '42%', size: 2, delay: 1.2 },
  { top: '40%', left: '90%', size: 3, delay: 0.6 },
  { top: '60%', left: '5%',  size: 2, delay: 1.5 },
  { top: '72%', left: '75%', size: 3, delay: 0.3 },
  { top: '85%', left: '30%', size: 2, delay: 1.0 },
  { top: '50%', left: '20%', size: 4, delay: 0.7 },
  { top: '30%', left: '3%',  size: 2, delay: 1.8 },
];

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#0d1b4b] via-[#1a3a6b] to-[#2d6eb5] relative overflow-hidden">
      {/* Decorative stars */}
      {STARS.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: star.delay, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-8">
          {/* Header with characters */}
          <div className="flex justify-center gap-4 mb-4">
            {(['bence', 'erno', 'szonja'] as const).map((c, index) => (
              <motion.div
                key={c}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.7 }}
              >
                <CharacterSVG characterId={c} size={40} />
              </motion.div>
            ))}
          </div>

          <h1 className="text-3xl font-display text-center text-white mb-2">
            🏝️ Sakk-Sziget Hősei
          </h1>
          <p className="text-center text-white/70 mb-6 font-body">
            {isLogin ? 'Szülői bejelentkezés' : 'Új fiók létrehozása'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-white/80">Név</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="A neved"
                  className="mt-1 rounded-xl text-lg h-12 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-amber-400"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-white/80">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@pelda.hu"
                className="mt-1 rounded-xl text-lg h-12 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">Jelszó</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 rounded-xl text-lg h-12 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-amber-400"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display rounded-2xl border-0 hover:from-amber-400 hover:to-orange-400"
            >
              {loading ? '⏳ Várj...' : isLogin ? '🔑 Belépés' : '✨ Regisztráció'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/70 hover:text-amber-300 font-medium transition-colors underline-offset-4 hover:underline"
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
