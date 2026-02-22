const publishers = [
  { name: "The New York Times", src: "https://upload.wikimedia.org/wikipedia/commons/5/58/NewYorkTimes.svg" },
  { name: "BBC", src: "https://upload.wikimedia.org/wikipedia/commons/6/62/BBC_News_2019.svg" },
  { name: "CNN", src: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg" },
  { name: "TechCrunch", src: "https://upload.wikimedia.org/wikipedia/commons/b/b9/TechCrunch_logo.svg" },
  { name: "Forbes", src: "https://upload.wikimedia.org/wikipedia/commons/1/12/Forbes_logo.svg" },
  { name: "The Guardian", src: "https://upload.wikimedia.org/wikipedia/commons/c/c5/The_Guardian_2018.svg" },
];

export default function PublisherLogoCloud() {
  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-black/60 backdrop-blur-xl border-t border-white/10 z-40 flex items-center justify-center gap-8 md:gap-16 pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
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
