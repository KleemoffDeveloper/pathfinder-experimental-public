export default function SeedPreview({
  image,
  title,
  plot,
  setGameplay,
  setSeed,
}) {
  return (
    <div className="active-story grid place-items-center gap-10 p-5">
      <div className="text-center grid w-full gap-5 place-items-center md:items-center md:grid-flow-col md:text-left">
        <img src={image} className="rounded-xl border-white border-2" />
        <div className="grid gap-5">
          <h1 className="text-4xl font-semibold">{title}</h1>
          <p>{plot}</p>
        </div>
      </div>
      <button
        onClick={() => {
          setSeed({ image: image, title: title, plot: plot });
          setGameplay(true);
        }}
        className="w-max"
      >
        Start Adventure
      </button>
    </div>
  );
}
