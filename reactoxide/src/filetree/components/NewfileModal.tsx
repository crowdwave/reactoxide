import React, {useEffect, useState} from 'react'
import EventEmitter from "eventemitter3";
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import sanitize from 'sanitize-filename';
import {FileTreeEntry, NewFileCreateArgs} from "../../typedefs";

type Props = {
    emitter: EventEmitter<string | symbol, any>;
}

export const NewfileModal = (props: Props) => {
    const {emitter} = props;
    const [getShowNewfilemodal, setShowNewfilemodal] = useState<boolean>(false);
    const [getNewfilename, setNewfilename] = useState<string>("");
    const [getFileTreeEntry, setFileTreeEntry] = useState<FileTreeEntry | undefined>(undefined);

    useEffect(() => {
        const handler = (fileTreeEntry: FileTreeEntry,) => {
            setFileTreeEntry(fileTreeEntry)
            setShowNewfilemodal(true)
            setNewfilename("")
        }
        emitter.addListener("SHOW_NEWFILE_MODAL", handler)
        return () => {
            emitter.removeListener("SHOW_NEWFILE_MODAL", handler)
        }
    }, [emitter, setShowNewfilemodal, setFileTreeEntry])

    const isValidFilename = (filename: string) => (filename === sanitize(filename))

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewfilename(e.target.value)

    const doCreateNewFile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // if we don't stop propagation then the click event goes to the file and tries to load it
        e.stopPropagation()
        if (getFileTreeEntry === undefined) return
        const newFileCreateArgs: NewFileCreateArgs = {
            newFilename: getNewfilename,
            fileTreeEntry: getFileTreeEntry,
        }
        emitter.emit("DO_NEWFILE_CREATE", newFileCreateArgs)
        // reset the component
        cancel()
    }

    const cancel = () => {
        setShowNewfilemodal(false)
        setNewfilename("")
        setFileTreeEntry(undefined)
    }

    if (!getShowNewfilemodal) return null
    //<input type="text" value="wrong value" className="form-control is-invalid" id="inputInvalid">

    return (
        <Modal size="lg" show={getShowNewfilemodal} onHide={() => {
        }}>
            <Modal.Header closeButton>
                <Modal.Title>New file</Modal.Title>
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
                           value={getNewfilename}
                    />
                    {(!isValidFilename(getNewfilename)) && <h5 className="text-danger mt-2">Invalid filename</h5>}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={cancel}>
                    cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={doCreateNewFile}
                    disabled={!isValidFilename(getNewfilename)}
                >
                    create
                </Button>
            </Modal.Footer>
        </Modal>
    )

}

