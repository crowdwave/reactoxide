
export type FileTreeEntry = {
    depth: number,
    containingDirectoryPath: string,
    dummy: boolean,
    filePath: string,
    id: string,
    isDirectoryOpen: boolean,
    isSelected: boolean,
    type: string,
}

export type RenameArgs = {
    destinationName: string;
    fileTreeEntry: FileTreeEntry,
    isDirectory: boolean;
    parentDirectoryPathString: string;
    sourceAbsolutePathString: string;
    targetAbsolutePathString: string;
}

export type NewFolderCreateArgs = {
    newFoldername: string;
    fileTreeEntry: FileTreeEntry,
}

export type StatusMessageArgs = {
    filename: string;
    message: string,
}

export type UploadFilesArgs = {
    fileTreeEntry: FileTreeEntry,
    filesToUpload: File[],
}

export type NewFileCreateArgs = {
    newFilename: string;
    fileTreeEntry: FileTreeEntry,
}

export type SaveFileArgs = {
    filepath: string;
    data: string,
}

export type OnNewfileCreatedArgs = {
    destinationName: string;
    isDirectory: boolean;
    parentDirectoryPathString: string;
    sourceAbsolutePathString: string;
    targetAbsolutePathString: string;
}
