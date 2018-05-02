const Pool = require('threads').Pool;
const pool = new Pool();

pool.run((opts, done) => {
    const fs = require('fs');
    const file = '/volume/exist.data';
    for (let i = 0; i < 100; i++) {
        if (!fs.existsSync(file)) {
            console.log('File does not exist!');
        } else {
            console.log('File exists.')
        }
        fs.readFileSync(file);
    }
    done();
});

for (let i = 0; i < 2; i++) {
    pool.send('test');
}

pool.on('finished', () => pool.killAll());
