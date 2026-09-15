/**
 * Vídeo do veículo em movimento. Aceita link do YouTube (embed — legal) ou
 * arquivo de vídeo direto (mp4). Server component (só markup).
 */
function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

export function CarVideo({ url }: { url: string }) {
  const yt = youtubeId(url);
  return (
    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-lg">
      {yt ? (
        <iframe
          src={`https://www.youtube.com/embed/${yt}?rel=0`}
          title="Vídeo do veículo em movimento"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
