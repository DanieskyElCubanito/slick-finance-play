import { useState } from 'react';
import { Button } from './ui/button'; // Usando tus componentes de shadcn que ya tienes en src/components/ui/

interface AdRewardButtonProps {
  onRewardGranted: () => void;
  buttonText?: string;
}

export function AdRewardButton({ onRewardGranted, buttonText = "📺 Ver Anuncio (+ Recompensa)" }: AdRewardButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleWatchAd = () => {
    setLoading(true);

    // Verificamos si la función global de Gigapub está cargada
    if (typeof window !== 'undefined' && (window as any).showGiga) {
      (window as any).showGiga()
        .then(() => {
          // El usuario vio el anuncio con éxito
          setLoading(false);
          onRewardGranted();
        })
        .catch((e: any) => {
          // Manejo de errores o si el usuario cerró el anuncio antes de tiempo
          console.error("Anuncio no completado o error:", e);
          setLoading(false);
        });
    } else {
      setLoading(false);
      alert("El sistema de anuncios aún está cargando. Inténtalo de nuevo en unos segundos.");
    }
  };

  return (
    <Button 
      onClick={handleWatchAd} 
      disabled={loading}
      className="w-full bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
    >
      {loading ? "Cargando anuncio..." : buttonText}
    </Button>
  );
}
