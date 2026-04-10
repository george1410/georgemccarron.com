export function YouTubeEmbed({ url }: { url: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden">
      <iframe
        src={url}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    </div>
  );
}
