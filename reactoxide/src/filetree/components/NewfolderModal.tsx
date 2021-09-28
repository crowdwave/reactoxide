import React, {useEffect, useState} from 'react'
import EventEmitter from "eventemitter3";
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import sanitize from 'sanitize-filename';
import {FileTreeEntry, NewFileCreateArgs, NewFolderCreateArgs} from "../../typedefs";

type Props = {
    emitter: EventEmitter<string | symbol, any>;
}

export const NewfolderModal = (props: Props) => {
    const {emitter} = props;
    const [getShowNewfolderModal, setShowNewfolderModal] = useState<boolean>(false);
    const [getNewfoldername, setNewfoldername] = useState<string>("");
    const [getFileTreeEntry, setFileTreeEntry] = useState<FileTreeEntry | undefined>(undefined);

    useEffect(() => {
        const handler = (fileTreeEntry: FileTreeEntry,) => {
            setFileTreeEntry(fileTreeEntry)
            setShowNewfolderModal(true)
            setNewfoldername("")
        }
        emitter.addListener("SHOW_NEWFOLDER_MODAL", handler)
        return () => {
            emitter.removeListener("SHOW_NEWFOLDER_MODAL", handler)
        }
    }, [emitter, setShowNewfolderModal, setFileTreeEntry])

    const isValidFilename = (filename: string) => (filename === sanitize(filename))

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewfoldername(e.target.value)

    const doCreateNewFolder = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // if we don't stop propagation then the click event goes to the file and tries to load it
        e.stopPropagation()
        if (getFileTreeEntry === undefined) return
        const newFolderCreateArgs: NewFolderCreateArgs = {
            newFoldername: getNewfoldername,
            fileTreeEntry: getFileTreeEntry,
        }
        emitter.emit("DO_NEWFOLDER_CREATE", newFolderCreateArgs)
        // reset the component
        cancel()
    }

    const cancel = () => {
        setShowNewfolderModal(false)
        setNewfoldername("")
        setFileTreeEntry(undefined)
    }

    if (!getShowNewfolderModal) return null
    //<input type="text" value="wrong value" className="form-control is-invalid" id="inputInvalid">

    return (
        <Modal size="lg" show={getShowNewfolderModal} onHide={() => {
        }}>
            <Modal.Header closeButton>
                <Modal.Title>New folder</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="form-group has-danger">
                    <input type="text"
                           className="form-control"
                           autoComplete="off"
                           autoCorrect="off"
                           autoCapitalize="off"
                           spellCheck="false"
                           placeholder=""
                           id="inputDefault"
                           onChange={onChange}
                           value={getNewfoldername}
                    />
                    {(!isValidFilename(getNewfoldername)) && <h5 className="text-danger mt-2">Invalid foldername</h5>}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={cancel}>
                    cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={doCreateNewFolder}
                    disabled={!isValidFilename(getNewfoldername)}
                >
                    create
                </Button>
            </Modal.Footer>
        </Modal>
    )

}

