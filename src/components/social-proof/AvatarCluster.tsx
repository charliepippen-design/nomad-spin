import { motion } from 'framer-motion';

const avatars = Array.from({ length: 8 }, (_, i) => `https://i.pravatar.cc/100?img=${i + 1}`);

export default function AvatarCluster() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="flex flex-col items-start gap-3 mt-8 w-full max-w-sm"
    >
      <div className="flex -space-x-3">
        {avatars.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            loading="lazy"
            className="w-10 h-10 rounded-full border-2 border-[#121212] z-10 object-cover"
          />
        ))}
      </div>
      <p className="text-sm font-medium text-gray-300 leading-tight">
        Join <strong className="text-white">14,500+</strong> remote workers exploring the world.
      </p>
    </motion.div>
  );
}
