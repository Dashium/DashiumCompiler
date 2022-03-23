const child_process = require('child_process');
const dotenv = require('dotenv').config();
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

var mode = process.argv[2];

var config = require('./config.json');

function clean(cleanFiles, dir){
    if(dir == null || cleanFiles == null){
        logger('err', `No argument found on clean function !`);
    }
    for(c=0;c<cleanFiles.length;c++){
        rimraf.sync(`${dir}/${cleanFiles[c]}`);
        logger('info', `clean ${cleanFiles[c]}`);
    }
}

function clone(repo, dest){
    if(repo == null || dest == null){
        logger('err', `No argument found on clone function !`);
        return false;
    }
    try {
        exec(`git clone ${repo} ${dest}`);
        logger('info', `${repo} done`);
    } catch (error) {
        logger('err', `Fail to clone '${repo}' repo`);
    }
}

function copyFileSync(source, target, remover){
    var targetFile = target;
    if(remover != null){
        targetFile = targetFile.replace(`/${remover}`, '');
        targetFile = targetFile.replace(`\\${remover}`, '');
    }
    if(fs.existsSync(target)){
        if(fs.lstatSync(target).isDirectory()){
            targetFile = path.join(target, path.basename(source));
        }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source));
    logger('info', targetFile);
}

function copyFolderRecursiveSync(source, target, remover){
    var files = [];
    var targetFolder = path.join(target, path.basename(source));
    if(remover != null){
        targetFolder = targetFolder.replace(`/${remover}`, '');
        targetFolder = targetFolder.replace(`\\${remover}`, '');
    }
    if(!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }
    if(fs.lstatSync(source).isDirectory()){
        files = fs.readdirSync(source);
        files.forEach(function(file){
            var curSource = path.join(source, file);
            if(fs.lstatSync(curSource).isDirectory()){
                copyFolderRecursiveSync(curSource, targetFolder, remover);
            }
            else{
                copyFileSync(curSource, targetFolder, remover);
            }
        });
    }
}

function create_dir(dir){
    try {
        if(fs.existsSync(dir) == false){
            fs.mkdirSync(dir);
            logger('info', `create '${dir}' dir`);
        }
    } catch (error) {
        logger('err', `Fail to create '${dir}' dir`);
    }
}

function create_dirs(dirs){
    for(i=0;i<dirs.length;i++){
        create_dir(dirs[i]);
        if(i == dirs.length - 1){
            return true;
        }
    }
}

async function exec(cmd){
    child_process.exec(cmd, (err, stdout) => {
        if(err){
            logger('err', err);
        }
    });
    sleep(7000);
}

function filter(key, value){
    if(key == null || value == null){
        logger('err', `No argument found on filter function !`);
        return false;
    }
    switch(key){
        case 'clean':
            clean(config[value[0]], value[1]);
            break;
        case 'clone':
            clone(value[0], value[1]);
            break;
        case 'exec':
            exec(value[0]);
            break;
        case 'function':
            for(fi=0;fi < Object.keys(config[value]).length; fi++){
                filter(config[value].type, config[value][fi]);
            }
            break;
        case 'keep':
            keep(value[0], config[value[1]]);
            break;
        case 'mkdir':
            create_dirs(value);
            break;
        case 'move':
            move(value[0], value[1]);
            break;
        case 'release':
            if(mode != 'test'){
                var GHTOKEN = process.env.GH_TOKEN;
                exec(`bash ${__dirname.replace(/\\/g, '/')}/release.sh ${GHTOKEN}`);
            }
            break;
        case 'wait':
            sleep(value);
            break;
        default:
            logger('err', `Not found key: ${key}`);
    }
}

function getFiles(dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for(var i in files){
        var name = dir + '/' + files[i];
        if(fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        }
    }
    return files_;
}

function init(){
    logger('info', 'STARTING !');
    for(ini=0;ini<Object.keys(config.order).length;){
        let key = Object.keys(config.order)[ini];
        let value = config.order[key];

        if(key.indexOf('function') == 0){
            key = "function";
            logger('info', `FUNCTION ${value} ===============================`);
        }
        
        filter(key, value);

        ini++;
    }
}

function keep(dir, keep_files, files_){
    if(fs.existsSync(dir) == true){
        files_ = files_ || [];
        var files = fs.readdirSync(dir);
        for(var i in files){
            var name = dir + '/' + files[i];
            if(fs.statSync(name).isDirectory()){
                for(k=0;k<keep_files.length;k++){
                    if(name != `${dir}/${keep_files[k]}`){
                        remove(name);
                        break;
                    }
                    else{
                        keep(name, keep_files, files_);
                    }
                }
            }
        }
        return files_;
    }
}

function logger(lvl, content){
    switch(lvl){
        case 'err':
            console.log(`ERROR: ${content}`);
            break;
        case 'info':
            console.log(`LOG: ${content}`);
            break;
        default:
            console.log(`LOG: ${content}`);
    }
}

function move(target, dest){
    var prefix = target.split('/');
        prefix = prefix[1];

    copyFolderRecursiveSync(target, dest, prefix);
}

function remove(target){
    rimraf.sync(target);
    logger('info', `Remove ${target} dir`);
}

const reset = new Promise(function(resolve, reject){
    try {
        logger('info', 'RESET ALL');
        remove('build');
        remove('dist');
        remove('release');
        setTimeout(() => {
            resolve('LOG: done');
        }, 1000);
    } catch (error) {
        reject(`ERROR: ${error}`);
    }
});

reset.then(function(value){
    console.log(value);
    init();
});

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}