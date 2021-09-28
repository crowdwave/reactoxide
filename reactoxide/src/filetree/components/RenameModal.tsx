import React, {useEffect, useState} from 'react'
import EventEmitter from "eventemitter3";
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import sanitize from 'sanitize-filename';
import {FileTreeEntry} from "../../typedefs";

type Props = {
    emitter: EventEmitter<string | symbol, any>;
}

// note we do not permit changes to directory paths, only changes to the filename itself.

export const RenameModal = (props: Props) => {
    const {emitter} = props;
    const [getShowRenamemodal, setShowRenamemodal] = useState<boolean>(false);
    const [getShowCannotProceedModalFile, setShowCannotProceedModalFile] = useState<boolean>(false);
    const [getShowCannotProceedModalDirectory, setShowCannotProceedModalDirectory] = useState<boolean>(false);
    const [getSourceFilename, setSourceFilename] = useState<string>("");
    const [getTargetFilename, setTargetFilename] = useState<string>("");
    const [getFileTreeEntry, setFileTreeEntry] = useState<FileTreeEntry | undefined>(undefined);
    const [getOpenFiles, setOpenFiles] = React.useState<string[]>([])

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

        const handler = (fileTreeEntry: FileTreeEntry) => {
            setFileTreeEntry(fileTreeEntry)

            if (fileTreeEntry.type === "directory") {
                // ensure ends with slash
                let directoryPath = `${fileTreeEntry.filePath}`
                if (!fileTreeEntry.filePath.endsWith("/")) {
                    directoryPath += "/"
                }
                for (let i=0;i < getOpenFiles.length;i++) {
                    if (getOpenFiles[i].startsWith(directoryPath)) {
                        setShowCannotProceedModalDirectory(true)
                        return
                    }
                }
            }

            if (getOpenFiles.includes(fileTreeEntry.filePath)) {
                setShowCannotProceedModalFile(true)
                return
            }
            setShowRenamemodal(true)
            setSourceFilename(fileTreeEntry.filePath)
            setTargetFilename(fileTreeEntry.filePath.split('/').pop() ?? "")
            //emitter.emit("ON_SELECT_FILE", fileTreeEntry)
        }
        emitter.addListener("SHOW_RENAME_MODAL", handler)
        return () => {
            emitter.removeListener("SHOW_RENAME_MODAL", handler)
        }
    }, [emitter, setShowRenamemodal, getOpenFiles, getShowCannotProceedModalFile])

    const isValidFilename = (filename: string) => {
        return (filename === sanitize(filename))
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTargetFilename(e.target.value)
    }

    const doRename = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // if we don't stop propagation then the click event goes to the file and tries to load it
        e.stopPropagation()
        if (getSourceFilename === getTargetFilename) return // nothing to do
        emitter.emit("DO_RENAME_FILE_OR_DIRECTORY", {
            fileTreeEntry: getFileTreeEntry,
            destinationName: getTargetFilename,
        })
        // reset the component
        cancel()
    }

    const cancel = () => {
        setFileTreeEntry(undefined)
        setSourceFilename("")
        setTargetFilename("")
        setShowRenamemodal(false)
        setShowCannotProceedModalFile(false)
        setShowCannotProceedModalDirectory(false)
    }

    if (getShowCannotProceedModalDirectory) {
        return (
            <Modal size="sm" show={setShowCannotProceedModalDirectory} onHide={cancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Rename</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group has-danger">
                        <h5 className="text-danger mt-2">There are tabs open under this directory. You must close those tabs before
                            renaming.</h5>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={cancel}>
                        ok
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    if (getShowCannotProceedModalFile) {
        return (
            <Modal size="sm" show={getShowCannotProceedModalFile} onHide={cancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Rename</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group has-danger">
                        <h5 className="text-danger mt-2">This file is open in a tab. You must close the tab before
                            renaming.</h5>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={cancel}>
                        ok
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }

    if (!getShowRenamemodal) return null
    //<input type="text" value="wrong value" className="form-control is-invalid" id="inputInvalid">

    return (
        <Modal size="lg" show={getShowRenamemodal} onHide={() => {
        }}>
            <Modal.Header closeButton>
                <Modal.Title>Rename</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="form-group has-danger">
                    <input type="text"
                           className="form-control"
                           autoComplete="off"
                           autoCorrect="off"
                           autoCapitalize="off"
                           spellCheck="false"
                           placeholder="Default input"
                           id="inputDefault"
                           onChange={onChange}
                           value={getTargetFilename}
                    />
                    {(!isValidFilename(getTargetFilename)) && <h5 className="text-danger mt-2">Invalid filename</h5>}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={cancel}>
                    cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={doRename}
                    disabled={!isValidFilename(getTargetFilename)}
                >
                    rename
                </Button>
            </Modal.Footer>
        </Modal>
    )

}

