import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterSVG, CHARACTER_INFO, type CharacterId } from '@/components/characters/CharacterSVG';
import { toast } from 'sonner';

const characterIds: CharacterId[] = ['bence', 'erno', 'szonja', 'huba', 'vanda', 'balazs'];

const Onboarding = () => {
  const [step, setStep] = useState(0); // 0: choose character, 1: name it
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshChildProfile } = useAuth();
  const navigate = useNavigate();

  const handleFinish = async () => {
    if (!user || !selectedCharacter || !characterName.trim()) return;
    setLoading(true);
    try {
      const { data: profileData, error } = await supabase.from('child_profiles').insert({
        user_id: user.id,
        character_id: selectedCharacter,
        character_name: characterName.trim(),
        aranytaller: 10,
      }).select('id').single();
      if (error || !profileData) throw error || new Error('Profil létrehozás sikertelen');

      // Create initial chapter progress
      await supabase.from('chapter_progress').insert({
        child_profile_id: profileData.id,
        chapter_number: 1,
        step: 'story',
      });

      await refreshChildProfile();
      toast.success('🎉 Üdv a Sakk-Szigeten!');
      navigate('/map');
    } catch (err: any) {
      toast.error(err.message || 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-island-sky to-island-grass flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-card rounded-3xl shadow-2xl p-8 border-4 border-accent">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-3xl font-display text-center text-foreground mb-2">
                  🏝️ Válassz egy hőst!
                </h1>
                <p className="text-center text-muted-foreground mb-6">
                  Ő lesz a társad a Sakk-Szigeten!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {characterIds.map((id) => {
                    const info = CHARACTER_INFO[id];
                    const isSelected = selectedCharacter === id;
                    return (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCharacter(id)}
                        className={`p-4 rounded-2xl border-4 transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'border-accent bg-accent/20 shadow-lg'
                            : 'border-border bg-card hover:border-accent/50'
                        }`}
                      >
                        <div className="animate-breathe">
                          <CharacterSVG characterId={id} size={80} />
                        </div>
                        <span className="font-display text-lg text-foreground">{info.name}</span>
                        <span className="text-sm text-muted-foreground">{info.piece}</span>
                        <span className="text-xs text-accent-foreground font-medium">„{info.motto}"</span>
                      </motion.button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => selectedCharacter && setStep(1)}
                  disabled={!selectedCharacter}
                  className="w-full mt-6 child-button bg-primary text-primary-foreground"
                >
                  Tovább ➡️
                </Button>
              </motion.div>
            ) : (
              <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="flex flex-col items-center mb-6">
                  <div className="animate-float">
                    <CharacterSVG characterId={selectedCharacter!} size={120} />
                  </div>
                  <h1 className="text-3xl font-display text-center text-foreground mt-4">
                    Adj nevet a hősödnek!
                  </h1>
                  <p className="text-muted-foreground text-center mt-1">
                    {CHARACTER_INFO[selectedCharacter!].name} a {CHARACTER_INFO[selectedCharacter!].piece} — mi legyen a neve?
                  </p>
                </div>

                <Input
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder={`pl. ${CHARACTER_INFO[selectedCharacter!].name}`}
                  className="rounded-xl text-xl h-14 text-center font-display"
                  maxLength={20}
                  autoFocus
                />

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setStep(0)}
                    variant="outline"
                    className="flex-1 child-button"
                  >
                    ⬅️ Vissza
                  </Button>
                  <Button
                    onClick={handleFinish}
                    disabled={!characterName.trim() || loading}
                    className="flex-1 child-button bg-accent text-accent-foreground"
                  >
                    {loading ? '⏳' : '🎉 Indulás!'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
