var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    http = require('http'),
    del = require('del'),
    rev = require('gulp-rev'),
    useref = require('gulp-useref'),
    filter = require('gulp-filter'),
    uglify = require('gulp-uglify'),
    filesize = require('gulp-filesize'),
    cleanCss = require('gulp-clean-css'),
    revReplace = require('gulp-rev-replace'),
    chalk = require('chalk');

var src = 'src',
    build = 'build',
    host = 'localhost';

function openBrowser(url) {
  var opener = require('opn');

  opener(url);
}

function contentType(filePath) {
  var ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
}

function serveFile(rootDir, requestUrl, response) {
  var urlPath = decodeURIComponent(requestUrl.split('?')[0]),
      relativePath = urlPath === '/' ? '/index.html' : urlPath,
      filePath = path.join(rootDir, relativePath),
      normalizedRoot = path.resolve(rootDir),
      normalizedFile = path.resolve(filePath);

  if (normalizedFile.indexOf(normalizedRoot) !== 0) {
    response.statusCode = 403;
    response.end('Forbidden');
    return;
  }

  fs.stat(normalizedFile, function (error, stats) {
    if (!error && stats.isDirectory()) {
      serveFile(rootDir, path.join(urlPath, 'index.html'), response);
      return;
    }

    if (error) {
      response.statusCode = 404;
      response.end('Not found');
      return;
    }

    fs.readFile(normalizedFile, function (readError, fileContents) {
      if (readError) {
        response.statusCode = 500;
        response.end('Server error');
        return;
      }

      response.statusCode = 200;
      response.setHeader('Content-Type', contentType(normalizedFile));
      response.end(fileContents);
    });
  });
}

function server(port, rootDir, next) {
  var app = http.createServer(function (request, response) {
    serveFile(rootDir, request.url, response);
  });

  app.listen(port, function () {
    var url = 'http://' + host + ':' + port;

    console.log(chalk.green('Started dev server on ' + url));
    openBrowser(url);

    if (typeof next === 'function') {
      next();
    }
  });

  return app;
}

function clean() {
  return del(build);
}

function images() {
  return gulp.src(src + '/images/**', {base: src})
    .pipe(gulp.dest(build));
}

function assets() {
  var jsFilter = filter(['**/*.js'], {restore: true}),
      cssFilter = filter(['**/*.css'], {restore: true});

  return gulp.src(src + '/*.html')
    .pipe(useref())
    .pipe(jsFilter)
    .pipe(uglify())
    .pipe(filesize())
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe(cleanCss())
    .pipe(filesize())
    .pipe(cssFilter.restore)
    .pipe(rev())
    .pipe(revReplace())
    .pipe(gulp.dest(build));
}

function collectFiles(directory) {
  return fs.readdirSync(directory).reduce(function (files, entry) {
    var filePath = path.join(directory, entry),
        relativePath = path.relative(build, filePath).replace(/\\/g, '/');

    if (relativePath === 'app.appcache' ||
        relativePath === 'index.html' ||
        relativePath === 'images/avroim_og.jpg') {
      return files;
    }

    if (fs.statSync(filePath).isDirectory()) {
      return files.concat(collectFiles(filePath));
    }

    return files.concat(relativePath);
  }, []);
}

function manifestTask() {
  var manifestPath = path.join(build, 'app.appcache'),
      files = collectFiles(build).sort(),
      contents = [
        'CACHE MANIFEST',
        '# ' + new Date().toISOString(),
        '',
        'CACHE:'
      ].concat(files, ['', 'NETWORK:', '*', '']).join('\n');

  fs.writeFileSync(manifestPath, contents);
  return Promise.resolve();
}

function serveDev(next) {
  server(process.env.DEVPORT || 8080, src, next);
}

function serveProd(next) {
  server(process.env.PORT || 8888, build, next);
}

function watchTask() {
  return gulp.watch(src + '/**', function (file) {
    console.log('Changed: ' + file.path);
  });
}

gulp.task('server', serveDev);
gulp.task('clean', clean);
gulp.task('images', gulp.series(clean, images));
gulp.task('assets', gulp.series(clean, images, assets));
gulp.task('manifest', gulp.series(assets, manifestTask));
gulp.task('build', gulp.series(clean, images, assets, manifestTask));
gulp.task('watch', gulp.series(serveDev, watchTask));
gulp.task('default', gulp.series(clean, images, assets, manifestTask, serveProd));
