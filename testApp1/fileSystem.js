'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_QUOTA_MB = 0;

var resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

var requestFileSystem = window.webkitRequestFileSystem || window.requestFileSystem;

var storageInfo = navigator.webkitPersistentStorage || {
    requestQuota: function requestQuota(bytes, successFn, errorFn) {
        errorFn(new Error('Not implemented'));
    }
};

var isSupported = !!navigator.webkitPersistentStorage;

function requestFS(bytes) {
    var promise = new Promise(function (resolve, reject) {
        requestFileSystem(window.PERSISTENT, bytes, function (fs) {
            resolve(fs);
        }, function (err) {
            reject(err);
        });
    });
    return promise;
}

var FileSystem = exports.FileSystem = function () {
    // _fs; // TODO: hide this reference to make truly private

    function FileSystem() {
        _classCallCheck(this, FileSystem);

        this.blobList = new Map();
        this.blobArrList = [];
        var promise = new Promise(function (resolve, reject) {
            storageInfo.requestQuota(DEFAULT_QUOTA_MB * 1024 * 1024, function (grantedBytes) {
                if (window.cordova) {
                    document.addEventListener('deviceready', function () {
                        requestFS(grantedBytes);
                    }, false);
                } else {
                    resolve(requestFS(grantedBytes));
                }
            }, function (err) {
                reject({ text: 'Error requesting Quota', obj: err });
            });
        });

        this._fs = promise;
    }

    _createClass(FileSystem, [{
        key: 'getCurrentUsage',
        value: function getCurrentUsage() {
            var promise = new Promise(function (resolve, reject) {
                storageInfo.queryUsageAndQuota(window.PERSISTENT, function (used, quota) {
                    resolve({ used: used, quota: quota });
                }, function (err) {
                    reject({ text: 'Error getting quota information', obj: err });
                });
            });

            return promise;
        }
    }, {
        key: 'requestQuota',
        value: function requestQuota(newQuotaMB) {
            var promise = new Promise(function (resolve, reject) {
                storageInfo.requestQuota(window.PERSISTENT, newQuotaMB * 1024 * 1024, function (grantedBytes) {
                    resolve(grantedBytes);
                }, function (err) {
                    reject({ text: 'Error requesting quota increase', obj: err });
                });
            });

            return promise;
        }
    }, {
        key: 'getDirectoryEntry',
        value: function getDirectoryEntry(path) {
            //remove leading slash if present
            path = path.replace(/^\//, '');

            var resolve = void 0,
                reject = void 0;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            function getContent(rootDir, folders) {
                //console.log("retrieving File contents");

                resolve(rootDir);
            }

            this._fs.then(function (fs) {
                getContent(fs.root, path.split('/'));
            }).catch(function (err) {
                return reject(err);
            });

            return promise;
        }
    }, {
        key: 'getFolderContents',
        value: function getFolderContents(path) {
            //remove leading slash if present
            path = path.replace(/^\//, '');

            var resolve = void 0,
                reject = void 0;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            function getContent(rootDir, folders) {
                //console.log("retrieving File contents");
                rootDir.getDirectory(folders[0], {}, function (dirEntry) {
                    var dirReader = dirEntry.createReader();
                    if (folders.length > 1) {
                        getContent(dirEntry, folders.slice(1));
                    } else {
                        dirReader.readEntries(function (entries) {
                            console.log("Reading entries", entries);
                            resolve(entries);
                        }, function (e) {
                            reject({ text: 'Error reading entries', obj: e });
                        });
                    }
                }, function (e) {
                    reject({ text: 'Error getting directory', obj: e });
                });
            }

            this._fs.then(function (fs) {
                getContent(fs.root, path.split('/'));
            }).catch(function (err) {
                return reject(err);
            });

            return promise;
        }
    }, {
        key: 'createFolder',
        value: function createFolder(path) {
            //remove leading slash if present
            path = path.replace(/^\//, '');

            var resolve = void 0,
                reject = void 0;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            function createDir(rootDir, folders) {
                rootDir.getDirectory(folders[0], { create: true }, function (dirEntry) {
                    if (folders.length > 1) {
                        createDir(dirEntry, folders.slice(1));
                    } else {
                        resolve(dirEntry);
                    }
                }, function (e) {
                    reject({ text: 'Error creating directory', obj: e });
                });
            }

            this._fs.then(function (fs) {
                createDir(fs.root, path.split('/'));
            }).catch(function (err) {
                return reject(err);
            });

            return promise;
        }
    }, {
        key: 'deleteFolder',
        value: function deleteFolder(path) {
            var recursive = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var resolve = void 0,
                reject = void 0;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            this._fs.then(function (fs) {
                fs.root.getDirectory(path, {}, function (dirEntry) {
                    if (recursive) {
                        dirEntry.removeRecursively(resolve, reject);
                    } else {
                        dirEntry.remove(resolve, reject);
                    }
                }, function (err) {
                    return reject({ text: 'Error getting directory', obj: err });
                });
            }).catch(function (err) {
                return reject(err);
            });

            return promise;
        }
    }, {
        key: 'writeBlob',
        value: function writeBlob(fileName, blob) {
            var append = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


            console.log("Writing blob into fiilename", fileName);
            this.blobList.set(fileName, blob);
            var resolve = void 0,
                reject = void 0;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            this._fs.then(function (fs) {
                fs.root.getFile(fileName, { create: true }, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        if (append) {
                            fileWriter.seek(fileWriter.length);
                        }

                        var truncated = false;
                        fileWriter.onwriteend = function (e) {
                            //truncate all data after current position
                            if (!truncated) {
                                truncated = true;
                                this.truncate(this.position);
                                return;
                            }
                            resolve('');
                        };

                        fileWriter.onerror = function (e) {
                            reject({ text: 'Write failed', obj: e });
                        };
                        //
                        fileWriter.write(blob);
                    }, function (e) {
                        reject({ text: 'Error creating file', obj: e });
                    });
                }, function (e) {
                    reject({ text: 'Error getting file', obj: e });
                });
            }).catch(function (err) {
                return reject(err);
            });

            return promise;
        }
    }, {
        key: 'writeFileInput',
        value: function writeFileInput(filename, file, mimeString) {
            var resolve = void 0,
                reject = void 0;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            var reader = new FileReader();

            reader.onload = function (e) {
                var buf = e.target.result;
                this.writeArrayBuffer(filename, buf, mimeString).then(resolve, reject);
            };

            reader.readAsArrayBuffer(file);

            return promise;
        }
    }, {
        key: 'writeText',
        value: function writeText(fileName, contents) {
            var append = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            var blob = new Blob([contents], { type: 'text/plain' });

            return this.writeBlob(fileName, blob, append);
        }
    }, {
        key: 'writeArrayBuffer',
        value: function writeArrayBuffer(fileName, buf, mimeString) {
            var append = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            var blob = new Blob([new Uint8Array(buf)], { type: mimeString });

            return this.writeBlob(fileName, blob, append);
        }
    }, {
        key: 'getFileEntry',
        value: function getFileEntry(fileName) {
            var resolve = void 0,
                reject = void 0;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            this._fs.then(function (fs) {
                fs.root.getFile(fileName, {}, resolve, function (err) {
                    return reject({ text: 'Error getting file', obj: err });
                });
            }).catch(function (err) {
                return reject(err);
            });

            return promise;
        }
    }, {
        key: 'getFile',
        value: function getFile(fileName) {
            return this.getFileEntry(fileName).then(function (fileEntry) {
                console.log("Getting fileentry inside getFile", fileEntry);
                var promise = new Promise(function (resolve, reject) {
                    fileEntry.file(resolve, function (e) {
                        reject({
                            text: 'Error getting file object',
                            obj: e
                        });
                    });
                });
                return promise;
            });
        }
    }, {
        key: 'getFileFromLocalFileSystemURL',
        value: function getFileFromLocalFileSystemURL(url) {
            var resolve = void 0,
                reject = void 0;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            window.resolveLocalFileSystemURL(url, function (fileEntry) {
                fileEntry.file(function (file) {
                    resolve(file);
                }, function (e) {
                    reject({ text: 'Error getting file object', obj: e });
                });
            }, function (e) {
                reject({ text: 'Error resolving FileSystem URL', obj: e });
            });

            return promise;
        }
    }, {
        key: 'readFile',
        value: function readFile(fileName, returnType) {
            var resolve = void 0,
                reject = void 0;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            this._fs.then(function (fs) {
                fs.root.getFile(fileName, {}, function (fileEntry) {
                    fileEntry.file(function (file) {
                        var reader = new FileReader();

                        reader.onloadend = function () {
                            resolve(this.result);
                        };
                        reader.onerror = function (e) {
                            reject({ text: "Error reading file", obj: e });
                        };

                        switch (returnType) {
                            case 'arraybuffer':
                                reader.readAsArrayBuffer(file);
                                break;
                            case 'binarystring':
                                reader.readAsBinaryString(file);
                                break;
                            case 'dataurl':
                                reader.readAsDataURL(file);
                                break;
                            default:
                                reader.readAsText(file);
                        }
                    }, function (err) {
                        return reject({ text: 'Error getting file', obj: err });
                    });
                }, function (err) {
                    return reject({ text: 'Error getting file', obj: err });
                });
            }).catch(function (err) {
                return reject(err);
            });

            return promise;
        }
    }, {
        key: 'deleteFile',
        value: function deleteFile(fullPath) {
            var resolve = void 0,
                reject = void 0;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });

            this._fs.then(function (fs) {
                fs.root.getFile(fullPath, { create: false }, function (fileEntry) {
                    fileEntry.remove(function () {
                        resolve('');
                    }, function (e) {
                        reject({ text: 'Error deleting file', obj: e });
                    });
                });
            }).catch(function (err) {
                return reject(err);
            });

            return promise;
        }
    }, {
        key: 'isSupported',
        get: function get() {
            return isSupported;
        }
    }]);

    return FileSystem;
}();

var fs = exports.fs = new FileSystem();