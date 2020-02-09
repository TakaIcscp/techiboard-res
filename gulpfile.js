const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const replace = require('gulp-string-replace');
const path = require('path');
const less = require('gulp-less');
const print = require('gulp-print').default;
const posthtml = require('gulp-posthtml');
const posthtmlParser = require('posthtml');
const postcss = require('gulp-postcss');
const tap = require('gulp-tap');
const fs = require('fs');
const color = require('gulp-color');
const gulpIf = require('gulp-if');
const requirejs = require('requirejs');
const deleteEmpty = require('delete-empty');
const cssmin = require("gulp-cssmin");
const gulpTslint = require("gulp-tslint");
const tslint = require("tslint");

const SRC_FOLDER = "src";
const BUILD_FOLDER = "build";
const DIST_FOLDER = "dist/000001";
const NODE_MODULES_FOLDER = "node_modules";

function replaceWithFile(replaceFrom, replaceTo, userOptions) {
   var currentFile;
   var newReplaceTo = function () {
      return replaceTo.apply(currentFile, arguments);
   };

   var result = replace(replaceFrom, newReplaceTo, userOptions);
   var transform = result._transform;

   result._transform = (file, enc, callback) => {
      currentFile = file;
      transform(file, enc, callback);
   }

   return result;
}

function getTsLintSrcGlobs() {
   return [
       path.join(SRC_FOLDER, "**/*.ts"),
       "!" + path.join(SRC_FOLDER, "**/*.d.ts")
   ];
}

function runTslint(fix, allowWarnings) {
   var program = tslint.Linter.createProgram("./tsconfig.json");

   return gulp.src(getTsLintSrcGlobs())
       .pipe(gulpTslint({
           program: program,
           formatter: "stylish",
           configuration: path.join(__dirname, "tslint.json"),
           fix: fix
       }))
       .pipe(gulpTslint.report({
           summarizeFailureOutput: true,
           allowWarnings: allowWarnings
       }));
}

/************************************************ TASKS ***************************************** */
function compileTs(destFolder, done) {
   const tsProject = ts.createProject('tsconfig.json');

   gulp.src(SRC_FOLDER + '/**/*.ts')
      .pipe(tsProject())
      .on('error', function(error) {
         done(error); 
      })
      .pipe(replaceWithFile(/(define\(\[)([^\]]+(?:\.html|\.less|\.css)[^\]]+)(?=\])/g, function (str, definePrefix, csvModules) {
         var processedFile = this.path;
         var processedPath = path.dirname(processedFile);

         var modules = (csvModules + "").split(",");
         var name;

         var modulesWithPluginPrefix = modules.map(module => {
               module = module.trim().replace(/[\"\']/g, "");

               name = null;
               if (!module.startsWith("text!") && !module.startsWith("css!")) {
                  if (module.endsWith(".html")) {
                     name = module;
                     module = "text!" + name;

                  } else if (module.endsWith(".less")) {
                     //we change .less imports to .css here
                     name = module.substring(0, module.length - 5) + ".css";
                     module = "css!" + name;

                  } else if (module.endsWith(".css")) {
                     name = module;
                     module = "css!" + name;
                  }
               }

               return `'${module}'`;
         });

         return definePrefix + modulesWithPluginPrefix.join(",");

      }, { logs: { enabled: false } }))
      .pipe(gulp.dest(destFolder))
      .on('error', function(error) {
         done(error); 
      })
      .on('end', function() {
         done();
      });
};

gulp.task('compile-ts', gulp.series(function(done) { return compileTs(BUILD_FOLDER, done) }));
gulp.task('compile-ts-dev', gulp.series(function(done) { return compileTs(DIST_FOLDER, done) }));

gulp.task('clear', gulp.parallel(function() {
   return del([DIST_FOLDER + '/**'], {force:true});
}, function() {
   return del([BUILD_FOLDER + '/**'], {force:true});
}));

gulp.task('copy-resources', function() {
   return gulp.src(
      [SRC_FOLDER+'/**/*.{js,json,jpg,png,ico,css,otf,eot,svg,ttf,woff,woff2,glb,gltf,wasm}', SRC_FOLDER + '/**/Page.html'])
        .pipe(print())
        .pipe(gulp.dest(DIST_FOLDER));
});

gulp.task('compile-less', gulp.series(function() {
   return gulp.src(SRC_FOLDER + '/**/*.less')
         .pipe(less({
            paths: [ path.join(__dirname) ]
         }))
         .pipe(gulp.dest(BUILD_FOLDER))
         .on('error', function(error) {
            done(error); 
         });
}));

gulp.task('compile-html', function() {
   return gulp.src(SRC_FOLDER+'/**/*.html')
        .pipe(print())
        .pipe(gulp.dest(BUILD_FOLDER));
});

gulp.task('copy-compiled', function() {
   return gulp.src([BUILD_FOLDER+'/**/*.{html,css}'])
        .pipe(gulp.dest(DIST_FOLDER));
});

let scopeTask;
gulp.task('scope', scopeTask = function() {
   let id = 0;
   const timeId = new Date().getTime();
   const files = {};

   const isHTML = (file) => {
      return /.html$/i.test(file.path);
   }

   const isCSS = (file) => {
      return /.css$/i.test(file.path);
   }

   const getFileGroup = (fileName) => {
      return fileName.replace(/\.(html|css)$/i, '');
   }

   const htmlConfig = (file) => ({
      plugins: [(tree) => {
         let fileGroup = getFileGroup(file.path);
         let scopeId = files[fileGroup];
         if (scopeId) {
            const SCOPE_ATTR = `_scope_${timeId}_${scopeId}`;
            const walkNode = (node, scope) => {
               if (!(typeof node === "object" && node.tag !== undefined))
                  return;

               node.attrs = node.attrs || {};
               node.attrs[SCOPE_ATTR] = true;

               if (node.tag == 'script' && (node.attrs || {}).type == 'text/html') {
                  if (node.content) {
                     // Template
                     var tree = posthtmlParser().process(node.content.join(""), { sync: true }).tree;
                     if (tree) {
                        walkTree(tree);
                        node.content = tree;
                     }
                  }

               } else if (typeof node.content === "object") {
                  // Normal node
                  walkTree(node.content);

               }
            }

            const walkTree = (tree, scope) => {
               tree.forEach((node) => {
                  walkNode(node);
               })
            }

            walkTree(tree);
            console.log(color(`Scoped html - ${scopeId}: ${file.path}`,'GREEN'));
         }
      }]
   });

   const cssConfig = [function (css, opts) {
      var fileName = opts.opts.from;
      let fileGroup = getFileGroup(fileName);
      var scopeId = files[fileGroup];
      if (scopeId) {
         var SCOPE_ATTR = `[_scope_${timeId}_${scopeId}]`;

         css.walkRules(function (rule) {
            var seps = [];

            // Splits expression into selectors and adds scope attribute after tag's name
            if ((rule.name == 'keyframes') || (rule.parent && rule.parent.name == 'keyframes')) {
               // ignore

            } else {
               var selectors = rule.selector.trim().replace(/\s*[>\+\~\s,]\s*/g, (separator) => { seps.push(separator); return "|" })
                     .split("|")
                     .map((selector, index) => {
                        var globalPattern = /^:global\((.*)\)$/gi.exec(selector);
                        if (globalPattern) {
                           return globalPattern[1] + (seps[index] || "");
                        }

                        var info = /^([^\.:\[]+)?(.*)$/gi.exec(selector);
                        return (info[1] || "") + SCOPE_ATTR + (info[2] || "") + (seps[index] || "");
                     })
                     .join("");

               rule.selector = [selectors];
            }
         });

         console.log(color(`Scoped css - ${scopeId}: ${fileName}`,'YELLOW'));
      }
  }];

   return gulp.src(BUILD_FOLDER+'/**/*.{html,css}')
      .pipe(tap(function (file) {
         const fileGroup = getFileGroup(file.path);
         const cssFile = fileGroup + '.css';
         const htmlFile = fileGroup + '.html';

         if (fs.existsSync(cssFile) && fs.existsSync(htmlFile)) {
            if (!files[fileGroup]) {
               const scopeId = (++id);
               files[fileGroup] = scopeId;
            }
         }
      }))
      .pipe(gulpIf(isHTML, posthtml(htmlConfig)))
      .pipe(gulpIf(isCSS, postcss(cssConfig)))
      .pipe(gulp.dest(BUILD_FOLDER));
});

gulp.task("min-css", () => {
   return gulp.src(path.join(BUILD_FOLDER, "/**/*.css"))
       .pipe(cssmin())
       .pipe(gulp.dest('.'));
});

//tslint without automatic fix
gulp.task("tslint", function () {
   return runTslint(false, true);
});

//tslint that treats warnings as errors
gulp.task("tslint-strict", function () {
   return runTslint(false, false);
});

//tslint with automatic fix (for some errors)
gulp.task("tslint-auto-fix", function () {
   return runTslint(true, true);
});

gulp.task('bundle', function(done) {
   const config = {
      baseUrl: 'Default',
      name: 'scripts/application',
      appDir: BUILD_FOLDER,
      dir: DIST_FOLDER,
      optimize: "uglify2",
      removeCombined: true,
      nodeIdCompat: true,
      writeBuildTxt: false,
      paths: {
         cesium: "./scripts/cesium-import",
         text: path.join("..", "..", NODE_MODULES_FOLDER, "text", "text"),
         css: path.join("..", "..", NODE_MODULES_FOLDER, "require-css", "css"),
         "css-builder": path.join("..", "..", NODE_MODULES_FOLDER, "require-css", "css-builder"),
         normalize: path.join("..", "..", NODE_MODULES_FOLDER, "require-css", "normalize")
      }
   };

   requirejs.optimize(config, function(){
      done();
   });
});

gulp.task('bundle-cleanup', (done) => {
   del([
       path.join(DIST_FOLDER, "**/*.{html,css,json,js}"),
       '!' + path.join(DIST_FOLDER, "**/scripts/application.js"),
       '!' + path.join(DIST_FOLDER, "**/styles/main.css")
   ]).then(() => {
	   deleteEmpty(DIST_FOLDER)
         .then(deleted => {
            done();
         })
         .catch(console.error);
   });
});

gulp.task('watch-resources', gulp.series(function () {
   let watcher = gulp.watch(SRC_FOLDER + '/**/*.{js,json,jpg,png,ico,css,otf,eot,svg,ttf,woff,woff2,wasm}');
   watcher.on('change', function(path, stats) {
      return gulp.src(path, {base: SRC_FOLDER})
            .pipe(gulp.dest(DIST_FOLDER))
            .pipe(print(filepath => ` updated: ${filepath}`));
            
   })
   watcher.on('add', function(path, stats) {
      return gulp.src(path, {base: SRC_FOLDER})
            .pipe(gulp.dest(DIST_FOLDER))
            .pipe(print(filepath => ` updated: ${filepath}`));
            
   })
   .on('error', function(error) {
      console.log(error);
   });
})); 

gulp.task('watch-ts', function () {
   gulp.watch(SRC_FOLDER + '/**/*.ts', gulp.series('compile-ts-dev'));
});

gulp.task('watch-less', function () {
   gulp.watch(SRC_FOLDER + '/**/*.less', gulp.series(gulp.parallel('compile-less', 'compile-html'), 'scope', 'copy-compiled'));
});

gulp.task('watch-html', function () {
   gulp.watch(SRC_FOLDER + '/**/*.html', gulp.series(gulp.parallel('compile-less', 'compile-html'), 'scope', 'copy-compiled'));
});

gulp.task('build', gulp.series('clear', gulp.parallel('compile-ts', 'compile-less', 'compile-html'), gulp.parallel('scope'), 'min-css', 'bundle', 'bundle-cleanup', 'copy-resources', function(done) {
   done();
}));

gulp.task('build-lint', gulp.series('clear', 'tslint', gulp.parallel('compile-ts', 'compile-less', 'compile-html'), gulp.parallel('scope'), 'min-css', 'bundle', 'bundle-cleanup', 'copy-resources', function(done) {
   done();
}));

gulp.task('build-dev', gulp.series('clear', gulp.parallel('compile-ts', 'compile-less', 'compile-html'), 'scope', gulp.parallel('copy-compiled', 'compile-ts-dev', 'copy-resources'), function(done) {
   done();
}));

gulp.task('watch', gulp.series(gulp.parallel('watch-ts', 'watch-less', 'watch-html', 'watch-resources'), function(done) {
   done();
}));
