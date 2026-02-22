import { motion } from 'framer-motion';

const avatars = Array.from({ length: 8 }, (_, i) => `https://i.pravatar.cc/100?img=${i + 1}`);

export default function AvatarCluster() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex items-center gap-4 pointer-events-auto mt-4"
    >
      <div className="flex -space-x-3">
        {avatars.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] shadow-lg object-cover"
          />
        ))}
      </div>
      <span className="text-sm font-medium text-white/90 drop-shadow-md">
        Join <strong>14,500+</strong> remote workers exploring the world.
      </span>
    </motion.div>
  );
}
