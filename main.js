const child_process = require('child_process');
const fs = require('fs');
const rimraf = require('rimraf');

var config = require('./config.json');

var dirs = [
    "build",
    "build/webserver",
    "build/dashboard",
    "dist"
];
var cleanFiles = [
    ".gitignore",
    "LICENSE",
    "README.md"
];

init();

function init(){
    reset();

    for(i=0;i<Object.keys(config.order);){
        console.log(config.order[i]);
        console.log('cc');
        i++
    }
    for(i=0;i<dirs.length;i++){
        create_dir(dirs[i]);
    }

    // BUILD
    exec('git clone https://github.com/Dashium/DashiumWebServer build/webserver', build());
    exec('git clone https://github.com/Dashium/DashiumDashboard build/dashboard', build());

    //DIST
    exec('git clone https://github.com/Dashium/Dashium dist', dist());
};

function build(){
    clean('build');
}

function dist(){
    move('build/webserver', 'dist/webserver')
}

function create_dir(dir){
    if(fs.existsSync(dir) == false){
        fs.mkdirSync(dir);
        console.log(`LOG: create ${dir} dir`);
    }
}

function move(target, dest){
    fs.copyFile(target, dest, () => {
        console.log('LOG: moved');
    })
}

function clean(dir){
    for(c=0;c<cleanFiles.length;c++){
        rimraf.sync(`${dir}/${cleanFiles[c]}`);
        console.log(`LOG: clean ${cleanFiles[c]}`);
    }
}

function reset(){
    if(fs.existsSync('build') == true){
        fs.rm('build', { recursive: true }, () => {
            console.log(`LOG: reset`);
        });
    }
    if(fs.existsSync('dist') == true){
        fs.rm('dist', { recursive: true }, () => {
            console.log(`LOG: reset`);
        });
    }
}

function exec(cmd, callback){
    child_process.exec(cmd, (err, stdout) => {
        if(err == null){
            if(cmd.indexOf('clone')){
                console.log(`LOG: repo clonned`);
                setTimeout(() => {
                    if(callback != null){
                        callback();
                    }
                }, 5000);
            }
        }
    });
}