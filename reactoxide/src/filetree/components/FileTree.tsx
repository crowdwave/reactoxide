import React from 'react'
import {FileTreeRow} from './FileTreeRow'
import EventEmitter from "eventemitter3";
import {FileTreeEntry} from "../../typedefs";

type PropsFileTree = {
    allFiles: Array<FileTreeEntry>;
    emitter: EventEmitter<string | symbol, any>;
    files: Array<FileTreeEntry>;
}

export const FileTree = (props: PropsFileTree) => {
    const {emitter, files, allFiles} = props

    const onSelect = (fileTreeEntry: FileTreeEntry) => {
        emitter.emit("DO_SELECT_FILE_OR_DIRECTORY", fileTreeEntry)
    }

    return (
        <React.Fragment>
            {files
                .filter((child: FileTreeEntry) => isRootLevel(files, child))
                .sort(sortingFunction)
                .map((child: FileTreeEntry) => (
                    <React.Fragment key={child.id}>
                        {child.type === 'directory' ? (
                            <Directory
                                allFiles={allFiles}
                                emitter={emitter}
                                fileTreeEntry={child}
                                files={files}
                            />
                        ) : (
                            <FileTreeRow
                                emitter={emitter}
                                fileTreeEntry={child}
                                onClick={() => {onSelect(child)}}
                            />
                        )}
                    </React.Fragment>
                ))}
        </React.Fragment>
    )
}

type PropsDirectory = {
    allFiles: Array<FileTreeEntry>;
    emitter: EventEmitter<string | symbol, any>;
    fileTreeEntry: FileTreeEntry;
    files: Array<FileTreeEntry>;
}

const Directory = (props: PropsDirectory) => {
    const {emitter, allFiles, fileTreeEntry} = props
    const children = allFiles.filter((item) => item.containingDirectoryPath === fileTreeEntry.id)

    const toggle = () => {
        if (fileTreeEntry.isDirectoryOpen) {
            emitter.emit("ON_DIRECTORY_CLOSE", fileTreeEntry)
        } else {
            emitter.emit("ON_DIRECTORY_OPEN", fileTreeEntry)
        }
    }

    return (
        <>
            <style>
                {`
                    .filerow:hover {
                        background-color: #343539;
                        color: white;
                        cursor: pointer;
                        }
                `}
            </style>
            <FileTreeRow
                emitter={emitter}
                fileTreeEntry={fileTreeEntry}
                onClick={toggle}
            />
            {fileTreeEntry.isDirectoryOpen ? (
                <FileTree
                    emitter={emitter}
                    files={children}
                    allFiles={props.allFiles}
                />
            ) : null}
        </>
    )
}


function sortingFunction(a: FileTreeEntry, b: FileTreeEntry) {
    // directories come first, sorted alphabetically
    // then files, also sorted alphabetically
    let first

    if (a.type === b.type) {
        if (a.filePath < b.filePath) first = a
        else first = b
    } else if (a.type === 'directory') {
        first = a
    } else {
        first = b
    }

    // js be weird
    if (first === a) return -1
    else return 1
}

function isRootLevel(files: Array<FileTreeEntry>, file: FileTreeEntry) {
    // find out if parent directory is in sub-tree

    const parentId = file.containingDirectoryPath
    if (!parentId) return true

    const parent = files.find(file => file.id === parentId)
    if (!parent) return true
}


