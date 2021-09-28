import React from "react";
import {FiletreeRoot} from "./filetree/FiletreeRoot";
import EventEmitter from "eventemitter3";

type Props = {
    emitter: EventEmitter<string | symbol, any>;
}

const TestShadow = ({emitter}: Props) => {

  return (
    <React.Fragment>
      <FiletreeRoot emitter={emitter}/>
    </React.Fragment>
  )
}

export default TestShadow;
