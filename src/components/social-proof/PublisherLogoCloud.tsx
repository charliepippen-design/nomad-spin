const publishers = ['The New York Times', 'BBC', 'CNN', 'TechCrunch', 'Forbes', 'The Guardian'];

export default function PublisherLogoCloud() {
  return (
    <div className="fixed bottom-0 left-0 w-full h-10 bg-black/40 backdrop-blur-md border-t border-white/5 z-40 flex items-center justify-center gap-8 md:gap-16 pointer-events-none">
      {publishers.map((name) => (
        <span
          key={name}
          className="text-xs md:text-sm font-semibold tracking-widest text-white/50 uppercase pointer-events-auto select-none"
        >
          {name}
        </span>
      ))}
    </div>
  );
}
