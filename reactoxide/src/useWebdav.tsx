import React, {useState, useEffect} from 'react';
import sanitize from 'sanitize-filename';
import {createClient, AuthType, FileStat, ResponseDataDetailed, BufferLike} from "webdav/web";
import EventEmitter from "eventemitter3";
import {
    RenameArgs,
    NewFileCreateArgs,
    OnNewfileCreatedArgs,
    FileTreeEntry,
    NewFolderCreateArgs,
    UploadFilesArgs, StatusMessageArgs, SaveFileArgs
} from "./typedefs";
import {FileTree} from "./filetree/components/FileTree";
import filesize from "filesize";

//const connectionstring: string = "http://localhost:8000"
const connectionstring: string = "https://webdav.reactoxide.com/"
export const webdavClient = createClient(connectionstring, {
    //username: "username",
    //password: "password"
});

const maxFileSize: number = 10 * 1000 * 1000; // 10 megabytes

type Props = {
    emitter: EventEmitter<string | symbol, any>;
}

type LoadFileResult = {
    filename: string,
    response: Buffer | ArrayBuffer | string | ResponseDataDetailed<BufferLike | string>,
}

const standardiseDirectoryPath = (directory: string) => {
    // returns a cleaned up directory path including top slash and tail slash
    let directoryArray: string[] = directory.split("/")
    // double slashes in the source string with result in the array containing items that are empty strings
    // remove them via filter
    directoryArray = directoryArray.filter(item => item !== "")
    // stick it back together into a nicely cleaned up string, wiuthout a trailing slash
    let directoryString = directoryArray.join("/")
    if (!directoryString.startsWith("/")) {
        directoryString = "/" + directoryString
    }
    if (!directoryString.endsWith("/")) {
        directoryString += "/"
    }
    return directoryString
}


export const useWebdav = ({emitter}: Props) => {
    const [getDirectoryItems, setDirectoryItems] = useState<Array<FileTreeEntry>>([]);
    const [getLoadFileResult, setLoadFileResult] = useState<LoadFileResult>();
    const [getOpenFiles, setOpenFiles] = React.useState<string[]>([])

    const getDirectoryContents = async (directory: string) => {
        const result = await webdavClient.getDirectoryContents(standardiseDirectoryPath(directory));
        let rv: Array<FileTreeEntry> = []
        for (const item of result as Array<FileStat>) {
            rv.push({
                containingDirectoryPath: standardiseDirectoryPath(directory),
                depth: item.filename.split("/").length - 2, // minus root, minus filename
                dummy: false,
                filePath: item.filename,
                id: item.filename,
                isDirectoryOpen: false,
                isSelected: false,
                type: item.type,
            })
        }
        return rv
    }

    const loadSubtree = React.useCallback(async (directory: string) => {
        // load the new directory entries and store in a variable
        const newFileTreeEntries = await getDirectoryContents(directory)

        directory = standardiseDirectoryPath(directory)
        setDirectoryItems((prev) => {
            // get information about which directories are open
            let opendirectories = prev.filter((item) => item.isDirectoryOpen).map((item) => standardiseDirectoryPath(item.filePath))

            // we have to manually add the directory we are currently opening
            opendirectories.push(directory)

            // root must be manually added
            if (!opendirectories.includes("/")) {
                opendirectories.push("/")
            }

            let rv: FileTreeEntry[] = []
            // remove the subdirectory entries
            rv = prev.filter((item) => item.containingDirectoryPath !== directory)

            // append the newly loaded entries
            rv = [...rv, ...newFileTreeEntries]

            // restore information about which directories are open
            rv = rv.map((item) => {
                if ((item.type === "directory") && opendirectories.includes(item.filePath + "/")) {
                    return {...item, isDirectoryOpen: true}
                }
                return {...item, isDirectoryOpen: false}
            })

            // mark this directory as open
            const directoryItem = rv.find((item) => (item.filePath === directory) && (item.type === "directory"))
            if (directoryItem !== undefined) {
                const arrayIndex = rv.findIndex(((item) => item.filePath === directoryItem.filePath));
                if (arrayIndex !== -1) {
                    rv[arrayIndex].isDirectoryOpen = true
                }
            }

            // get id of the selected file tree item
            const selectedItem = prev.find((item) => item.isSelected)

            // restore the selected file tree item
            //Find index of specific object using findIndex method.
            if (selectedItem !== undefined) {
                const arrayIndex = rv.findIndex(((item) => item.id === selectedItem.id));
                if (arrayIndex !== -1) {
                    rv[arrayIndex].isSelected = true
                }
            }

            // removed orphaned subdirectory entries
            // it is possible that there was an open directory that is now gone, leaving orphaned items in the filetree
            // we must remove them
            rv = rv.filter((item) => opendirectories.includes(item.containingDirectoryPath))

            return rv
        })
    }, [setDirectoryItems])

    const transformGetDirectoryItems = React.useCallback(() => {
        return getDirectoryItems.map((item: FileTreeEntry): FileTreeEntry => {
            const id = (item.type === "directory") ? standardiseDirectoryPath(item.filePath) : item.filePath
            return {
                containingDirectoryPath: standardiseDirectoryPath(item.containingDirectoryPath),
                depth: item.depth, // minus root, minus filename
                dummy: false,
                filePath: item.filePath,
                id: id,
                isDirectoryOpen: item.isDirectoryOpen,
                isSelected: item.isSelected,
                type: item.type,
            }
        })
    }, [getDirectoryItems])

    useEffect(() => {
        const doSelectFileOrDirectory = (fileTreeEntry: FileTreeEntry) => {
            /*            if (fileTreeEntry.filePath !== undefined) {
                            alert("undefined")
                        }*/
            setDirectoryItems((prev) => {
                return prev.map((item) => {
                    if (fileTreeEntry.id === item.id) {
                        return {...item, isSelected: true}
                    }
                    return {...item, isSelected: false}
                })
            })
            // open the file, but only if it is not already open
            if (!getOpenFiles.includes(fileTreeEntry.filePath)) {
                emitter.emit("DO_LOAD_FILE", fileTreeEntry)
            }
        }
        emitter.addListener("DO_SELECT_FILE_OR_DIRECTORY", doSelectFileOrDirectory)
        return () => {
            emitter.removeListener("DO_SELECT_FILE_OR_DIRECTORY", doSelectFileOrDirectory)
        }
    }, [emitter, setDirectoryItems, getOpenFiles])

    useEffect(() => {
        const handler = (openFiles: string[]) => {
            console.log("ON_OPEN_FILES_CHANGED", openFiles)
            setOpenFiles(openFiles)
        }
        emitter.addListener("ON_OPEN_FILES_CHANGED", handler)
        return () => {
            emitter.removeListener("ON_OPEN_FILES_CHANGED", handler)
        }
    }, [emitter, setOpenFiles])


    useEffect(() => {
        const init = async () => {
            await loadSubtree("/");
        }
        init();
    }, [loadSubtree]);

    useEffect(() => {
        const asyncHandler = async (fileTreeEntry: FileTreeEntry) => {
            await loadSubtree(fileTreeEntry.filePath)
        }
        const handler = (fileTreeEntry: FileTreeEntry) => asyncHandler(fileTreeEntry)
        emitter.addListener("ON_DIRECTORY_OPEN", handler)
        return () => {
            emitter.removeListener("ON_DIRECTORY_OPEN", handler)
        }
    }, [loadSubtree, setDirectoryItems, emitter])

    const closeSubdirectory = React.useCallback((fileTreeEntry: FileTreeEntry) => {
        setDirectoryItems((prev) => {
                return prev.map((item) => {
                    if ((item.filePath === fileTreeEntry.filePath) && (item.type === "directory")) {
                        return {...item, isDirectoryOpen: false}
                    }
                    return item
                })
            }
        )

        setDirectoryItems((prev) => {
            //removeDirectoryItems(prev)
            return prev.filter((item) => {
                if (item.filePath === standardiseDirectoryPath(fileTreeEntry.filePath)) {
                    return true
                }
                return !item.filePath.startsWith(standardiseDirectoryPath(fileTreeEntry.filePath)) // NOTE TRAILING SLASH!
            })
        });
    }, [setDirectoryItems])

    useEffect(() => {
        emitter.addListener("ON_DIRECTORY_CLOSE", closeSubdirectory)
        return () => {
            emitter.removeListener("ON_DIRECTORY_CLOSE", closeSubdirectory)
        }
    }, [emitter, closeSubdirectory])

    useEffect(() => {
        const asyncHandler = async (fileTreeEntry: FileTreeEntry) => {
            await loadSubtree(fileTreeEntry.containingDirectoryPath);
        }
        const handler = (fileTreeEntry: FileTreeEntry) => asyncHandler(fileTreeEntry)
        emitter.addListener("ON_FILE_RENAMED", handler)
        return () => {
            emitter.removeListener("ON_FILE_RENAMED", handler)
        }
    }, [emitter, setDirectoryItems])

    useEffect(() => {

            const asyncHandler = async (fileTreeEntry: FileTreeEntry) => {
                setDirectoryItems((prev) => {
                    // remove any file from the tree that is underneath the renamed directoiry
                    return prev.filter((item) => {
                        // we DONT remove the renamed directory itself, because doing so disappears it from the tree
                        if (item.filePath === fileTreeEntry.filePath) {
                            return true
                        }
                        // NOTE THE ADDED SLASH!  Without this, NAY directory starting the the target name is removed
                        return !item.filePath.startsWith(`${fileTreeEntry.filePath}/`)
                    })
                });
                // then reload the directory that the renamed directory lives in
                await loadSubtree(fileTreeEntry.containingDirectoryPath);

            }
            const handler = (fileTreeEntry: FileTreeEntry) => asyncHandler(fileTreeEntry)
            emitter.addListener("ON_DIRECTORY_RENAMED", handler)
            return () => {
                emitter.removeListener("ON_DIRECTORY_RENAMED", handler)
            }
        }, [emitter, setDirectoryItems]
    )

    useEffect(() => {
        const asyncHandler = async (fileTreeEntry: FileTreeEntry) => {
            await loadSubtree(fileTreeEntry.containingDirectoryPath);
        }
        const handler = (fileTreeEntry: FileTreeEntry) => asyncHandler(fileTreeEntry)
        emitter.addListener("ON_FILE_OR_DIRECTORY_DELETED", handler)
        return () => {
            emitter.removeListener("ON_FILE_OR_DIRECTORY_DELETED", handler)
        }
    }, [emitter])

    useEffect(() => {
        const asyncHandler = async (fileTreeEntry: FileTreeEntry) => {
            //const stat: FileStat | ResponseDataDetailed<FileStat>  = await webdavClient.stat(fileTreeEntry.filePath);
            // grrr can't wrk out corrcet syntax to get the size property with correct typing
            const stat: any = await webdavClient.stat(fileTreeEntry.filePath);
            // maxFileSize 0 means do not enforce a maximum
            if (maxFileSize > 0) {
                if (stat.size > maxFileSize) {
                    alert(`file size (${filesize(stat.size)}) exceeds maxFileSize ${filesize(maxFileSize)}`)
                    return
                }
            }
            const response = await webdavClient.getFileContents(fileTreeEntry.filePath);
            //const rv  = await webdavClient.getFileContents(filename, {format: "text"});
            setLoadFileResult(
                {
                    filename: fileTreeEntry.filePath,
                    response: response,
                }
            );
            emitter.emit("ON_FILE_LOADED", {
                filename: fileTreeEntry.filePath,
                response: response,
            })
        }
        const handler = (fileTreeEntry: FileTreeEntry) => asyncHandler(fileTreeEntry)
        emitter.addListener("DO_LOAD_FILE", handler)
        return () => {
            emitter.removeListener("DO_LOAD_FILE", handler)
        }
    }, [emitter])

    useEffect(() => {
        const asyncHandler = async (saveFileArgs: SaveFileArgs) => {
            const {filepath, data} = saveFileArgs
            const response = await webdavClient.putFileContents(filepath, data);
            emitter.emit("ON_FILE_SAVED")
        }
        const handler = (saveFileArgs: SaveFileArgs) => asyncHandler(saveFileArgs)
        emitter.addListener("DO_SAVE_FILE", handler)
        return () => {
            emitter.removeListener("DO_SAVE_FILE", handler)
        }
    }, [emitter])

    useEffect(() => {
        const asyncHandler = async (fileTreeEntry: FileTreeEntry) => {
            const response = await webdavClient.deleteFile(fileTreeEntry.filePath);

            // after deletion of a file or directory we tell the rest of the system to clean up
            emitter.emit("ON_FILE_OR_DIRECTORY_DELETED", fileTreeEntry)

            // after deletion of a file or directory we make sure nothing is selected
            emitter.emit("DO_DESELECT_ALL")
        }
        const handler = (fileTreeEntry: FileTreeEntry) => asyncHandler(fileTreeEntry)
        emitter.addListener("DO_DELETE_FILE_OR_DIRECTORY", handler)
        return () => {
            emitter.removeListener("DO_DELETE_FILE_OR_DIRECTORY", handler)
        }
    }, [emitter])

    useEffect(() => {
        type Args = {
            fileTreeEntry: FileTreeEntry,
            destinationName: string;
        }

        const asyncHandler = async (args: Args) => {
            const {fileTreeEntry} = args
            if (fileTreeEntry.type === "directory") {
                await doRenameDirectory(args)
            } else {
                await doRenameFile(args)
            }
        }

        const doRenameDirectory = async (args: Args) => {
            const {destinationName, fileTreeEntry} = args
            // clean up the destinationName - make sure it has no path
            let destinationFilename: string = destinationName.split("/").pop() ?? ""
            const response = await webdavClient.moveFile(
                fileTreeEntry.filePath,
                fileTreeEntry.containingDirectoryPath + destinationFilename
            );
            // after renaming of a file or directory we tell the rest of the system to clean up
            emitter.emit("ON_DIRECTORY_RENAMED", fileTreeEntry)
            // after renaming of a file or directory we make sure nothing is selected
            emitter.emit("DO_DESELECT_ALL")
        }

        const doRenameFile = async (args: Args) => {
            // we start with a source absolute path (sourceAbsolutePath) and the new name of the target item
            const {destinationName, fileTreeEntry} = args
            // clean up the destinationName - make sure it has no path
            let destinationFilename: string = destinationName.split("/").pop() ?? ""
            const response = await webdavClient.moveFile(
                fileTreeEntry.filePath,
                fileTreeEntry.containingDirectoryPath + destinationFilename
            );
            // after renaming of a file or directory we tell the rest of the system to clean up
            emitter.emit("ON_FILE_RENAMED", fileTreeEntry)
            // after renaming of a file or directory we make sure nothing is selected
            emitter.emit("DO_DESELECT_ALL")
        }
        const handler = (args: Args) => asyncHandler(args)

        emitter.addListener("DO_RENAME_FILE_OR_DIRECTORY", handler)
        return () => {
            emitter.removeListener("DO_RENAME_FILE_OR_DIRECTORY", handler)
        }
    }, [emitter])

    useEffect(() => {
        const asyncHandler = async (directory: string) => {
            // we remove all the open items from the tree that live under the renamed directory
            // there's probably a way to do this whilst retaining the open/closed state of all directories
            // but it got too hard and it doesn't matter enough to pursue
            setDirectoryItems((prev) => {
                return prev.filter((item) => {
                    return !(standardiseDirectoryPath(item.containingDirectoryPath) === standardiseDirectoryPath(directory))
                })
            });
            await loadSubtree(directory);
        }
        const handler = (directory: string) => asyncHandler(directory)
        emitter.addListener("ON_FILE_CREATED", handler)
        return () => {
            emitter.removeListener("ON_FILE_CREATED", handler)
        }
    }, [emitter, loadSubtree, setDirectoryItems])

    useEffect(() => {

        const asyncHandler = async (args: NewFileCreateArgs) => {
            let {newFilename, fileTreeEntry} = args

            // if the user clicked the "new file" icon on a file, then we create the file in the directory of the file
            // if the user clicked the "new file" icon on a directory, then we create the file inside that directory
            let targetDirectory: string;
            if (fileTreeEntry.type === "directory") {
                // so, if it's a file, we get the target directory by removing the filename
                targetDirectory = standardiseDirectoryPath(fileTreeEntry.filePath) + "/"
            } else {
                targetDirectory = standardiseDirectoryPath(fileTreeEntry.containingDirectoryPath) + "/"
            }

            // clean up the destinationName - make sure it has no path
            newFilename = newFilename.split("/").pop() ?? ""
            const data: string = ""
            const response = await webdavClient.putFileContents(targetDirectory + newFilename, data);
            // after renaming of a file or directory we tell the rest of the system to clean up
            emitter.emit("ON_FILE_CREATED", targetDirectory)

            // after renaming of a file or directory we make sure nothing is selected
            emitter.emit("DO_DESELECT_ALL")
        }
        const handler = (args: NewFileCreateArgs) => asyncHandler(args)
        emitter.addListener("DO_NEWFILE_CREATE", handler)
        return () => {
            emitter.removeListener("DO_NEWFILE_CREATE", handler)
        }
    }, [emitter])


    useEffect(() => {
        const asyncHandler = async (directory: string) => {
            // we remove all the open items from the tree that live under the renamed directory
            // there's probably a way to do this whilst retaining the open/closed state of all directories
            // but it got too hard and it doesn't matter enough to pursue
            setDirectoryItems((prev) => {
                return prev.filter((item) => {
                    return !(standardiseDirectoryPath(item.containingDirectoryPath) === standardiseDirectoryPath(directory))
                })
            });
            await loadSubtree(directory);
        }
        const handler = (directory: string) => asyncHandler(directory)
        emitter.addListener("ON_FOLDER_CREATED", handler)
        return () => {
            emitter.removeListener("ON_FOLDER_CREATED", handler)
        }
    }, [emitter, loadSubtree, setDirectoryItems])

    useEffect(() => {

        const asyncHandler = async (args: NewFolderCreateArgs) => {
            let {newFoldername, fileTreeEntry} = args

            // if the user clicked the "new file" icon on a file, then we create the file in the directory of the file
            // if the user clicked the "new file" icon on a directory, then we create the file inside that directory
            let targetDirectory: string;
            if (fileTreeEntry.type === "directory") {
                // so, if it's a file, we get the target directory by removing the filename
                targetDirectory = standardiseDirectoryPath(fileTreeEntry.filePath) + "/"
            } else {
                targetDirectory = standardiseDirectoryPath(fileTreeEntry.containingDirectoryPath) + "/"
            }

            // clean up the destinationName - make sure it has no path
            newFoldername = newFoldername.split("/").pop() ?? ""
            const data: string = ""
            const response = await webdavClient.createDirectory(targetDirectory + newFoldername);
            // after renaming of a file or directory we tell the rest of the system to clean up
            emitter.emit("ON_FOLDER_CREATED", targetDirectory)

            // after renaming of a file or directory we make sure nothing is selected
            emitter.emit("DO_DESELECT_ALL")
        }
        const handler = (args: NewFolderCreateArgs) => asyncHandler(args)
        emitter.addListener("DO_NEWFOLDER_CREATE", handler)
        return () => {
            emitter.removeListener("DO_NEWFOLDER_CREATE", handler)
        }
    }, [emitter])

    useEffect(() => {
        const asyncHandler = async (fileTreeEntry: FileTreeEntry) => {
            await loadSubtree(fileTreeEntry.filePath);
        }
        const handler = (fileTreeEntry: FileTreeEntry) => asyncHandler(fileTreeEntry)
        emitter.addListener("ON_FILE_UPLOAD_COMPLETE", handler)
        return () => {
            emitter.removeListener("ON_FILE_UPLOAD_COMPLETE", handler)
        }
    }, [emitter])

    useEffect(() => {

        const asyncHandler = async (args: UploadFilesArgs) => {
            let {filesToUpload, fileTreeEntry} = args

            // if the user clicked the "new file" icon on a file, then we create the file in the directory of the file
            // if the user clicked the "new file" icon on a directory, then we create the file inside that directory
            let targetDirectory: string;
            if (fileTreeEntry.type === "directory") {
                // so, if it's a file, we get the target directory by removing the filename
                targetDirectory = standardiseDirectoryPath(fileTreeEntry.filePath) + "/"
            } else {
                targetDirectory = standardiseDirectoryPath(fileTreeEntry.containingDirectoryPath) + "/"
            }

            for (const file of filesToUpload) {
                if (file.name === undefined) return
                // clean up the destinationName - make sure it has no path
                let filename = file.name.split("/").pop()
                if (filename === undefined) return
                filename = sanitize(filename)
                if (filename === undefined) return
                const filedataBuffer = await file.arrayBuffer();
                const response = await webdavClient.putFileContents(targetDirectory + filename, filedataBuffer,
                    {
                        onUploadProgress: (progress) => {
                            const args: StatusMessageArgs = {
                                message: `Uploaded ${progress.loaded} bytes of ${file.size}`,
                                filename: filename ?? "",
                            }
                            emitter.emit("ON_FILE_UPLOAD_PROGRESS", args)
                        }
                    });
            }
            // after renaming of a file or directory we tell the rest of the system to clean up
            emitter.emit("ON_FILE_UPLOAD_COMPLETE", fileTreeEntry)

            // after renaming of a file or directory we make sure nothing is selected
            emitter.emit("DO_DESELECT_ALL")
        }
        const handler = (args: UploadFilesArgs) => asyncHandler(args)
        emitter.addListener("DO_UPLOAD_FILES", handler)
        return () => {
            emitter.removeListener("DO_UPLOAD_FILES", handler)
        }
    }, [emitter])

    return {getDirectoryItems: transformGetDirectoryItems} // syntax for aliasing the function name
}

