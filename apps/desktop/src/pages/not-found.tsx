import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppNavigate } from "@/hooks/useNavigate";

export default function NotFound() {
  const { navigate } = useAppNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        className="z-10 flex flex-col items-center text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Compass className="h-24 w-24 text-primary relative z-10" strokeWidth={1.5} />
        </motion.div>

        <h1 className="text-8xl font-black tracking-tighter text-foreground mb-4">404</h1>
        
        <h2 className="text-2xl font-bold tracking-tight text-foreground/80 mb-3">
          You're off the map
        </h2>
        
        <p className="text-muted-foreground max-w-sm mb-10 text-lg">
          The page you are looking for doesn't exist, has been moved, or is currently unavailable.
        </p>

        <Button onClick={() => navigate('/dashboard')} size="lg" className="h-12 px-8 rounded-full shadow-lg shadow-primary/20 group">
          <Home className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          Back to Dashboard
        </Button>
      </motion.div>
    </div>
  );
}
