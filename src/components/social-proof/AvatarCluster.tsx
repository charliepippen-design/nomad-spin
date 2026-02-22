import { motion } from 'framer-motion';

const avatars = Array.from({ length: 8 }, (_, i) => `https://i.pravatar.cc/100?img=${i + 1}`);

export default function AvatarCluster() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex items-center gap-3 mt-3"
    >
      <div className="flex -space-x-2.5">
        {avatars.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            className="w-7 h-7 rounded-full border-2 border-background object-cover"
          />
        ))}
      </div>
      <span className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground">
        Join <strong className="text-foreground/80">14,500+</strong> remote players
      </span>
    </motion.div>
  );
}
