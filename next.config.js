module.exports = {
  async redirects() {
    return [
      {
        source: '/blog/posts',
        destination: '/blog',
        permanent: true,
      },
    ];
  },
};
