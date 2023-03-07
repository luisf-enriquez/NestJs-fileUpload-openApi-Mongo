export default () => ({
    port: parseInt(process.env.PORT, 10) || 8000,
    pokeApiBaseUrl: process.env.POKE_API_BASE || 'https://pokeapi.co/api/v2',
    validMimeTypes: process.env.VALID_MIME_TYPES || 'image/jpeg,image/jpg,image/png', // comma separated values
    database: {
      url: process.env.MONGODB_URI || "mongodb://localhost/pokedex",
      bucketName: process.env.MONGODB_BUCKET_NAME || "images", 
      maxFileSize: process.env.MAX_FILE_SIZE || (10 * 1024 * 1024), // default 10 MB
      synchronize: process.env.NODE === 'prod' ? false: true
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'superSecretKey',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
});