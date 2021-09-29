import React, {useEffect, useState, useRef} from 'react'
import EventEmitter from "eventemitter3";
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import sanitize from 'sanitize-filename';
import {
    FileTreeEntry,
    NewFileCreateArgs,
    NewFolderCreateArgs,
    StatusMessageArgs,
    UploadFilesArgs
} from "../../typedefs";
import filesize from "filesize"

type Props = {
    emitter: EventEmitter<string | symbol, any>;
}

export const UploadModal = (props: Props) => {
    const {emitter} = props;
    const [getMaxFileSizeExceeded, setMaxFileSizeExceeded] = useState<boolean>(false);
    const [getUploadComplete, setUploadComplete] = useState<boolean>(false);
    const [getShowUploadModal, setShowUploadModal] = useState<boolean>(false);
    const [getStatusMessages, setStatusMessages] = useState<Record<string, string>>({});
    const [getFileTreeEntry, setFileTreeEntry] = useState<FileTreeEntry | undefined>(undefined);
    const [getFilesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [getInputKey, setInputKey] = useState(0);
    const refInput = useRef<HTMLInputElement>(null);
    const maxFileSize: number = 10 * 1000 * 1000; // 30 megabytes

    const onChange = ({currentTarget: {files}}: React.ChangeEvent<HTMLInputElement>) => {
        if (files && files.length) {
            setFilesToUpload(Array.from(files));
        }
        // Reset the input by forcing a new one
        setInputKey(key => key + 1);
    }

    useEffect(() => {
        for (const file of getFilesToUpload) {
            if (file.size > maxFileSize) {
                setMaxFileSizeExceeded(true)
                return
            } else {
                setMaxFileSizeExceeded(false)
            }
        }
    }, [getFilesToUpload, setMaxFileSizeExceeded])

    useEffect(() => {
        const handler = (fileTreeEntry: FileTreeEntry,) => {
            setFileTreeEntry(fileTreeEntry)
            setShowUploadModal(true)
        }
        emitter.addListener("SHOW_UPLOAD_MODAL", handler)
        return () => {
            emitter.removeListener("SHOW_UPLOAD_MODAL", handler)
        }
    }, [emitter, setShowUploadModal, setFileTreeEntry])

    useEffect(() => {
        const handler = (args: StatusMessageArgs) => {
            setUploadComplete(true)
        }
        emitter.addListener("ON_FILE_UPLOAD_COMPLETE", handler)
        return () => {
            emitter.removeListener("ON_FILE_UPLOAD_COMPLETE", handler)
        }
    }, [emitter, setShowUploadModal, setFileTreeEntry])

    useEffect(() => {
        const handler = (args: StatusMessageArgs) => {
            setStatusMessages((prev) => {
                return {...prev, [args.filename]: args.message}
            })
        }
        emitter.addListener("ON_FILE_UPLOAD_PROGRESS", handler)
        return () => {
            emitter.removeListener("ON_FILE_UPLOAD_PROGRESS", handler)
        }
    }, [emitter, setShowUploadModal, setFileTreeEntry])

    const doUploadFiles = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // if we don't stop propagation then the click event goes to the file and tries to load it
        e.stopPropagation()
        if (getFileTreeEntry === undefined) return
        if (getFilesToUpload.length === 0) return
        const uploadFilesArgs: UploadFilesArgs = {
            fileTreeEntry: getFileTreeEntry,
            filesToUpload: getFilesToUpload,
        }
        emitter.emit("DO_UPLOAD_FILES", uploadFilesArgs)
    }

    const isValidFilename = () => true
    const cancel = () => {
        setUploadComplete(false)
        setShowUploadModal(false)
        setFilesToUpload([])
        setFileTreeEntry(undefined)
        setStatusMessages({})
    }

    if (!getShowUploadModal) return null
    //<input type="text" value="wrong value" className="form-control is-invalid" id="inputInvalid">

    return (
        <Modal size="lg" show={getShowUploadModal} onHide={() => {
        }}>
            <Modal.Header closeButton>
                <Modal.Title>Upload files</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="form-group has-danger">
                    {(Object.keys(getStatusMessages).length > 0) ?
                        <div>
                            {
                                Object.entries(getStatusMessages).map(([key, val]) =>
                                    (
                                        <>
                                            <span style={{"color": "white"}} key={key}>{key}: </span>
                                            <span style={{"color": "gold"}} key={key}
                                                  className={"float-end"}>{val}</span>
                                        </>
                                    )
                                )
                            }
                        </div>

                        :
                        <>
                            <form>
                                {(getFilesToUpload.length > 0) &&
                                <>
                                    Selected files ({getFilesToUpload.length}):
                                    <ul>
                                        {getFilesToUpload.map((file, index) =>
                                            <li key={index}>
                                                {file.name} {filesize(file.size)}
                                                {(file.size > maxFileSize)
                                                &&
                                                <span style={{"color": "red"}}>
                                                        {`  FILE EXCEEDS MAX SIZE OF: ${filesize(maxFileSize)}`}
                                                    </span>
                                                }
                                            </li>
                                        )}
                                    </ul>
                                </>
                                }
                                <Button
                                    variant="primary"
                                    onClick={() => refInput.current?.click()}
                                >choose files </Button>
                                <input key={getInputKey}
                                       type="file"
                                       ref={refInput}
                                       multiple={true}
                                       style={{display: "none"}}
                                       onChange={onChange}/>
                            </form>
                            {(!isValidFilename()) && <h5 className="text-danger mt-2">Invalid foldername</h5>}
                        </>
                    }
                </div>
            </Modal.Body>
            <Modal.Footer>
                {(getUploadComplete) ?
                    <>
                        upload complete!&nbsp;&nbsp;
                        <Button variant="secondary" onClick={cancel}>
                            close
                        </Button>
                    </>
                    :
                    <>
                        {(Object.keys(getStatusMessages).length === 0) &&
                            <Button variant="secondary" onClick={cancel}>
                                cancel
                            </Button>
                        }
                        <Button
                            variant="primary"
                            onClick={doUploadFiles}
                            disabled={(getFilesToUpload.length === 0) || getMaxFileSizeExceeded}
                        >
                            {(Object.keys(getStatusMessages).length === 0) ? "start upload!" : "uploading, please wait"}
                        </Button>
                    </>
                }
            </Modal.Footer>
        </Modal>
    )

}

