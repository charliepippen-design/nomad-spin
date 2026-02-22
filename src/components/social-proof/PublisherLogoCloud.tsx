const publishers = [
  { name: "The New York Times", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/NewYorkTimes.svg/1024px-NewYorkTimes.svg.png" },
  { name: "CNN", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/1024px-CNN.svg.png" },
  { name: "TechCrunch", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TechCrunch_logo.svg/1024px-TechCrunch_logo.svg.png" },
  { name: "The Guardian", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/The_Guardian_2018.svg/1024px-The_Guardian_2018.svg.png" },
];

export default function PublisherLogoCloud() {
  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-black/60 backdrop-blur-xl border-t border-white/10 z-40 flex items-center justify-center gap-8 md:gap-16 pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <span className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase mr-4">As seen on</span>
      {publishers.map((pub) => (
        <img
          key={pub.name}
          src={pub.src}
          alt={`${pub.name} logo`}
          className="h-5 md:h-6 w-auto opacity-50 hover:opacity-100 transition-opacity duration-300 object-contain [filter:brightness(0)_invert(1)] hover:[filter:none]"
        />
      ))}
    </div>
  );
}
