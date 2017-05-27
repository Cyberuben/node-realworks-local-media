const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

class LocalMediaTransport {
	constructor(options, parent) {
		if(!options) options = {};

		this._options = options;
		this._parent = parent;
		this._logger = this._parent.logger;

		if(this._options.imagePath) {
			this.imagePath = this._options.imagePath;
		}else{
			this.imagePath = path.join(path.dirname(require.main.filename), "images");
		}

		mkdirp.sync(this.imagePath);
	}

	store(id, buffer, originalName, localName) {
		return new Promise((resolve, reject) => {
			mkdirp(path.join(this.imagePath, id), (err) => {
				if(err) {
					this._logger.log("ERR", "Error creating folder for object", id, err);
					return reject(err);
				}

				fs.writeFile(path.join(this.imagePath, id, localName), buffer, (err) => {
					if(err) {
						this._logger.log("ERR", "Error storing file "+localName, id, err);
						return reject(err);
					}

					return resolve();
				});
			});
		});
	}

	remove(id, localName) {
		return new Promise((resolve, reject) => {
			fs.unlink(path.join(this.imagePath, id, localName), (err) => {
				if(err) {
					if(err.code == "ENOENT") {
						return resolve();
					}

					this._logger.log("ERR", "Error removing file "+localName, id, err);
					return reject(err);
				}

				return resolve();
			});
		});
	}

	clean(id) {
		return new Promise((resolve, reject) => {
			fs.rmdir(path.join(this.imagePath, id), (err) => {
				if(err) {
					if(err.code == "ENOENT") {
						return resolve();
					}

					this._logger.log("ERR", "Error cleaning media folder", id, err);
					return reject(err);
				}

				return resolve();
			});
		});
	}
}

module.exports = LocalMediaTransport;