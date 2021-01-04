module.exports = {
  apps: [
    {
      name: 'kitim',
      script: './dist/app.js',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
