module.exports = function(grunt) {

    //Construct and validate the arguments
    var args = {
        branch: grunt.option("branch")
    };

    (function validateInput(){
        if (!args.branch) {throw new Error("No branch specified!");}
    }());

    function getFilesToAddToGit(extFiles) {
        var list = "";
        extFiles.forEach(function(extFile) {
            list += " '" + extFile.localPath + "'";
        });
        return list;
    }

    grunt.initConfig({
        exec: {
            switchContentSubmoduleToTipOfBranch: {
                cmd: "git checkout -f " + args.branch +
                    " && git pull --rebase" +
                    " && git submodule update --init --recursive",
                cwd: "./Content"
            },
            fetchExternalFiles: {
                cmd: "node ./fetch-externals.js"
            },
            addExternalFilesToGit: {
                cmd: "git add " + getFilesToAddToGit(grunt.file.readJSON('./external-files.json')),
                cwd: "./Content"
            },
            commitAndPushExternalFiles: {
                cmd: "git commit -m'Update external files' && git push origin || true",
                cwd: "./Content"
            }
        }
    });

    grunt.loadNpmTasks("grunt-exec");

    grunt.registerTask("default", [
        "exec:switchContentSubmoduleToTipOfBranch",
        "exec:fetchExternalFiles",
        "exec:addExternalFilesToGit",
        "exec:commitAndPushExternalFiles"
    ]);
};
