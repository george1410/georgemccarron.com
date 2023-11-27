export const YouTubeEmbed = ({ url }: { url: string }) => {
  return (
    <iframe
      className='w-full aspect-video rounded-lg overflow-clip'
      src={url}
      allowFullScreen
    ></iframe>
  );
};
