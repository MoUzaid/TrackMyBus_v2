const fs = require('fs');
const path = require('path');

function checkDir(d) {
  fs.readdirSync(d, { withFileTypes: true }).forEach(f => {
    if (f.isDirectory()) {
      checkDir(path.join(d, f.name));
    } else if (f.name.endsWith('.js')) {
      const content = fs.readFileSync(path.join(d, f.name), 'utf8');
      const regex = /import\s+.*?from\s+['"](.*?)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        let imp = match[1];
        if (imp.startsWith('.')) {
          let p = path.resolve(d, imp);
          
          let exts = ['.js', '.jsx', '.css', '.png', '.svg'];
          let matchedExt = '';
          
          if (!path.extname(p)) {
              for (let ext of exts) {
                  if (fs.existsSync(p + ext)) {
                      p += ext;
                      matchedExt = ext;
                      break;
                  }
              }
              if (fs.existsSync(path.join(p, 'index.js'))) {
                  p = path.join(p, 'index.js');
              }
          }
          
          if (fs.existsSync(p)) {
            let dirname = path.dirname(p);
            let basename = path.basename(p);
            let actualFiles = fs.readdirSync(dirname);
            if (!actualFiles.includes(basename)) {
              let actual = actualFiles.find(a => a.toLowerCase() === basename.toLowerCase());
              console.log('Case mismatch in ' + path.join(d, f.name) + ': imported as ' + basename + ' but found ' + actual);
            }
          } else {
             // console.log("Can't find " + p);
          }
        }
      }
    }
  });
}

checkDir('src');
console.log('Case check done!');
