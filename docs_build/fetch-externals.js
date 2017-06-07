#! /bin/node

var request = require("request");
var fs = require("fs");

var externalFiles = JSON.parse(fs.readFileSync("./external-files.json"));
externalFiles.forEach(function(extFile) {
    extFile.localPath = "./Content/" + extFile.localPath;
});

var ExternalFile = function(extFileInfo) {
    this._info = extFileInfo;
    //Some stupid space appears after JSON.parse at the beginning of each line...
    this._info.header = this._info.header.replace(/^ /gm, "");
}

ExternalFile.prototype = {
    fetch: function() {
        var self = this;
        var onRetrieveRemoteFileContent = function(content) {
            content = self._updateHeader(content);
            self._saveContent(content);
        }
        this._retrieveRemoteFileContent(onRetrieveRemoteFileContent);
    },

    _retrieveRemoteFileContent: function(onRetrieve) {
        console.log("Retrieving changelog from: " + this._info.url);
        request(this._info.url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                onRetrieve(body);
            }
        });
    },

    _updateHeader: function(content) {
        var contentWithoutHeader = content.replace(/^---$(.|\n)*?^---$/m, "")
        return this._info.header + contentWithoutHeader;
    },

    _saveContent: function(content) {
        fs.writeFileSync(this._info.localPath, content);
    }
}

var main = function() {
    externalFiles.forEach(function(extFileInfo) {
        var extFile = new ExternalFile(extFileInfo);
        extFile.fetch();
    });
}

main();
