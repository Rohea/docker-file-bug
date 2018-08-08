const Pool = require('threads').Pool;
const pool = new Pool();
const fs = require('fs');

if (!fs.existsSync('/test-share/vendor')){
  fs.mkdirSync('/test-share/vendor');
}

// Prepare the testcase
const testRootPath = '/volume/';
for (let i = 0; i < 10; i++) {
  const folderPath = testRootPath + i;
  // Create the folder
  if (!fs.existsSync(folderPath)){
    fs.mkdirSync(folderPath);
  }
  // Create symlink
  if (!fs.existsSync('/test-share/vendor/' + i)) {
    fs.symlinkSync(folderPath, '/test-share/vendor/' + i);
  }

  for (let j = 0; j < 100; j++) {
    const filePath = folderPath + '/' + j;
    if (!fs.existsSync(filePath)){
      fs.writeFileSync(filePath, 'Hello World!');
    }
  }
}


pool.run((opts, done) => {
    const fs = require('fs');
    const testRootPath = '/test-share/vendor/';
    for (let i = 0; i < 10; i++) {
      const folderPath = testRootPath + i;
      for (let j = 0; j < 100; j++) {
        const filePath = folderPath + '/' + j;
        if (!fs.existsSync(filePath)) {
            console.log('File does not exist!');
        } else {
          console.log('.');
        }

        if (fs.readFileSync(filePath, 'utf-8') !== 'Hello World!') {
          console.log('Invalid contents!');
        }
      }
    }
    done();
});

for (let i = 0; i < 10; i++) {
    pool.send('test');
}

pool.on('finished', () => pool.killAll());
