import connect from 'connect';
import serveStatic from 'serve-static';

connect()
  .use(serveStatic(__dirname))
  .listen(8080, () => {
    console.log('Server running on 8080...');
  });
