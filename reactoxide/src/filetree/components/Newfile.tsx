import React, {useState} from 'react'
import {Icon} from './icon'
import EventEmitter from "eventemitter3";
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import {NewfileModal} from "./NewfileModal";
import {FileTreeEntry} from "../../typedefs";

type Props = {
    emitter: EventEmitter<string | symbol, any>;
    fileTreeEntry: FileTreeEntry;
}

export const Newfile = (props: Props) => {
    const {emitter, fileTreeEntry} = props;

    const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // if we don't stop propagation then the click event goes to the file and tries to load it
        e.stopPropagation()
        emitter.emit("SHOW_NEWFILE_MODAL", fileTreeEntry)
    }

    return (
        <>
            <Icon iconname="IconNewfile" tooltip="create new file" onClick={onClick}/>
        </>
    )
}

